import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
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
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Slug already exists');
        }
      }
      throw error;
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async filter(filterData: FilterDto) {
    const { topics = [], search_text, page, limit, rating } = filterData;
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
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }
    const [results, total] = await query.getManyAndCount();

    return {
      total,
      results: results.map((blog: BlogsEntity) => ({
        ...blog,
        meta_data: makeMetaDataContent(blog, blog.image.url, blog.slug),
      })),
    };
  }
  async findLatestBlogPerTopic() {
    const new_blogs_of_each_topic = await this.blogRepo
      .createQueryBuilder('blog')
      // .where({
      //   is_published: true,
      // })
      .innerJoin('blog.topic', 'topic')
      .where((qb: SelectQueryBuilder<BlogsEntity>) => {
        const sub_query = qb
          .subQuery()
          .select('b.id')
          .from(BlogsEntity, 'b')
          .where('b.topic_id = blog.topic_id')
          .orderBy('b.created_at', 'DESC')
          .limit(6)
          .getQuery();
        return 'blog.id IN ' + sub_query;
      })
      .leftJoin('blog.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.first_name', 'user.last_name'])
      .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])
      .orderBy('topic.id', 'ASC')
      .addOrderBy('blog.created_at', 'DESC')
      .getMany();
    const grouped_topics = new_blogs_of_each_topic.reduce((acc, blog) => {
      const topic_id = blog.topic_id;
      if (!acc[topic_id]) {
        acc[topic_id] = [];
      }
      acc[topic_id].push(blog);
      return acc;
    }, {});
    return grouped_topics;
  }

  async findOne(identifier: string) {
    const query = this.blogRepo.createQueryBuilder('blog');
    if (isNumeric(identifier)) {
      query.where('blog.id =:id', { id: +identifier });
    } else {
      query.where('blog.slug ILIKE :slug', { slug: `%${identifier}%` });
    }

    const blog = await query
      .leftJoin('blog.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.first_name', 'user.last_name'])
      .leftJoin('blog.topic', 'topic')
      .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])

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
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Slug already exists');
        }
      }
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
    return await this.blogRepo
      .createQueryBuilder('blog')
      .orderBy('blog.created_at', 'DESC')
      // .where({
      //   is_published: true,
      // })
      .leftJoin('blog.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.first_name', 'user.last_name'])
      .leftJoin('blog.topic', 'topic')
      .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])
      .take(LIMIT_DEFAULT)
      .getMany();
  }
}
