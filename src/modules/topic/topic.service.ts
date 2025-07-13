import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TopicDto } from './dto/topic.dto';
import { DataSource, ILike, QueryFailedError, Repository } from 'typeorm';
import { TopicEntity } from './entities/topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { makeMetaDataContent } from 'common/helpers/metadata';
import { FilesService } from 'modules/files/files.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly topicRepo: Repository<TopicEntity>,
    private readonly dataSource: DataSource,
    private readonly fileService: FilesService,

    // private readonly mailerService: MailerService,
  ) {}
  async create(createTopicDto: TopicDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const data = this.topicRepo.create(createTopicDto);
      const result = await this.topicRepo.save(data);
      if (result.image.public_id) {
        await this.fileService.markImageAsUsed([result.image.public_id]);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Topic already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page?: number, limit?: number, search_text?: string) {
    const query = this.topicRepo.createQueryBuilder('topic');
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }
    const [results, total] = await query
      .orderBy('topic.name', 'ASC')
      .getManyAndCount();
    return {
      total,
      results:
        results.map((topic) => ({
          ...topic,
          meta_data: makeMetaDataContent(
            topic,
            topic.image.url,
            '/topic/' + topic.slug,
          ),
        })) || [],
    };
  }
  async search(search_text: string) {
    const [results, total] = await this.topicRepo
      .createQueryBuilder('topic')
      .where({
        name: ILike(`%${search_text}%`),
      })
      .getManyAndCount();
    return {
      total,
      results,
    };
  }

  async findOneById(id: number) {
    const data = await this.topicRepo.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('Topic not found');
    }
    return data;
  }

  async update(id: number, updateTopicDto: TopicDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const topic = await this.topicRepo.findOneBy({
        id,
      });
      if (!topic) {
        throw new NotFoundException('Topic not found');
      }

      const result = await this.topicRepo.update(id, updateTopicDto);
      if (result.affected === 0) {
        throw new InternalServerErrorException('Cannot update topic');
      }
      const has_new_image =
        updateTopicDto.image &&
        updateTopicDto.image.public_id &&
        updateTopicDto.image.public_id !== topic.image.public_id;
      if (has_new_image) {
        await this.fileService.markImageAsUsed([
          updateTopicDto.image.public_id,
        ]);
      }
      if (has_new_image && topic.image.public_id !== '') {
        await this.fileService.delete(topic.image.public_id);
      }

      await queryRunner.commitTransaction();
      return {
        id,
        ...updateTopicDto,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Topic already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const topic = await this.topicRepo.findOneBy({
        id,
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
      if (topic.image.public_id) {
        await this.fileService.delete(topic.image.public_id);
      }
      await this.topicRepo.delete(id);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
