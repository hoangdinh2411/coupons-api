import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from 'modules/users/entities/users.entity';
import { isNumeric } from 'common/helpers/number';
import { ROLES } from 'common/constants/enums';
import { BlogsEntity } from './entities/blogs.entity';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogDto } from './dto/blog.dto';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { FilterDto } from 'common/constants/filter.dto';
import { makeMetaDataContent } from 'common/helpers/metadata';
import { TopicService } from 'modules/topic/topic.service';
import { FilesService } from 'modules/files/files.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogRepo: Repository<BlogsEntity>,
    private readonly topicService: TopicService,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource,
  ) {}
  async create(user: UserEntity, createBlogDto: BlogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const topic = await this.topicService.findOneById(createBlogDto.topic_id);
      const new_blog = this.blogRepo.create({
        ...createBlogDto,
        user,
        created_by: user.id,
        topic,
      });
      const result = await this.blogRepo.save(new_blog);
      if (result.image.public_id) {
        await this.fileService.markImageAsUsed([result.image.public_id]);
      }

      if (result.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(result.content);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async filter(filterData: FilterDto) {
    const { topics = [], search_text, page, rating } = filterData;
    const query = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.topic', 'topic');
    if (search_text) {
      query.andWhere(`blog.title ILIKE :search_text`, {
        search_text: `%${search_text}%`,
      });
    }
    if (rating !== undefined) {
      query.andWhere('blog.rating <= :rating', {
        rating: Number(rating),
      });
    }
    if (topics.length > 0) {
      query.andWhere('blog.topic_id IN (:...topics)', {
        topics,
      });
    }

    const [results, total] = await query
      .skip((page - 1) * LIMIT_DEFAULT)
      .take(LIMIT_DEFAULT)
      .getManyAndCount();

    return {
      total,
      results: results.map((blog: BlogsEntity) => ({
        ...blog,
        meta_data: makeMetaDataContent(blog, blog.image.url, blog.slug),
      })),
    };
  }
  findAll() {
    return this.blogRepo.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(identifier: string) {
    const query = this.blogRepo.createQueryBuilder('blog');
    if (isNumeric(identifier)) {
      query.where('blog.id =:id', { id: +identifier });
    } else {
      query.where('blog.slug =:slug', { slug: +identifier });
    }

    const blog = await query
      .leftJoinAndSelect('blog.user', 'created_by')
      .leftJoinAndSelect('blog.topic', 'topic')
      .getOne();
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return {
      ...blog,
      meta_data: makeMetaDataContent(blog, blog.image.url, blog.slug),
    };
  }
  async findOneById(id: number) {
    const data = await this.blogRepo.findOneBy({
      id,
    });
    if (!data) {
      throw new NotFoundException('Blog not found');
    }

    return data;
  }

  async update(user: UserEntity, id: number, updateBlogDto: UpdateBlogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let topic = null;
      if (updateBlogDto.topic_id) {
        topic = await this.topicService.findOneById(updateBlogDto.topic_id);
      }
      const blog = await this.blogRepo.findOne({
        where: {
          id,
          deleted_at: null,
        },
      });
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      if (user.role !== ROLES.ADMIN && blog.created_by !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this blog',
        );
      }
      const data = {
        ...blog,
        ...updateBlogDto,
        ...(topic && { topic }),
      };
      const result = await this.blogRepo.save(data);
      const has_new_image =
        updateBlogDto.image &&
        updateBlogDto.image.public_id &&
        updateBlogDto.image.public_id !== blog.image.public_id;
      if (has_new_image) {
        await this.fileService.markImageAsUsed([updateBlogDto.image.public_id]);
      }
      if (has_new_image && blog.image.public_id !== '') {
        await this.fileService.delete(blog.image.public_id);
      }
      if (result.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(result.content);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, user: UserEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blog = await this.blogRepo.findOneBy({
        id,
      });
      if (!blog) {
        throw new NotFoundException('Blog not found ');
      }
      if (user.role !== ROLES.ADMIN && blog.created_by !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this blog',
        );
      }
      if (blog.image.public_id) {
        await this.fileService.delete(blog.image.public_id);
      }
      await this.blogRepo.delete(id);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLatestBlogs() {
    return await this.blogRepo.find({
      take: LIMIT_DEFAULT,
      order: {
        created_at: 'ASC',
      },
    });
  }
}
