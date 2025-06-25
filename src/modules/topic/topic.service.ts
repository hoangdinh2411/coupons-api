import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TopicDto } from './dto/topic.dto';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { TopicEntity } from './entities/topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { makeMetaDataContent } from 'common/helpers/metadata';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly topicRepo: Repository<TopicEntity>,
    // private readonly mailerService: MailerService,
  ) {}
  async create(createTopicDto: TopicDto) {
    try {
      const data = this.topicRepo.create(createTopicDto);
      return await this.topicRepo.save(data);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Topic already exist');
        }
      } else {
        throw error;
      }
    }
  }

  async findAll(limit: number, page: number, search_text: string) {
    const query = this.topicRepo.createQueryBuilder('topic');
    if (limit && page) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }
    const [results, total] = await query.getManyAndCount();
    return {
      total,
      results:
        results.map((topic) => ({
          ...topic,
          meta_data: makeMetaDataContent(
            topic,
            topic.image_bytes,
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
    const result = await this.topicRepo.update(id, updateTopicDto);
    if (result.affected === 0) {
      throw new NotFoundException('Topic not found');
    }
    return {
      id,
      ...updateTopicDto,
    };
  }

  async remove(id: number) {
    const result = await this.topicRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Topic not found');
    }
    return true;
  }
}
