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
import { FilterDto } from 'common/constants/filter.dto';
import { TopicService } from 'modules/topic/topic.service';
import { FilesService } from 'modules/files/files.service';
import { TopicEntity } from 'modules/topic/entities/topic.entity';
import { FAQService } from 'modules/faqs/services/faqs.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogRepo: Repository<BlogsEntity>,
    private readonly topicService: TopicService,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource,
    private readonly faqService: FAQService,
  ) {}
  async create(user: UserEntity, { faqs, ...createBlogDto }: BlogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const topic = await this.topicService.findOneById(createBlogDto.topic_id);
      const new_blog = this.blogRepo.create({
        ...createBlogDto,
        user,
        topic,
      });
      const result = await this.blogRepo.save(new_blog);

      if (faqs) {
        await this.faqService.saveFaqs(
          faqs,
          {
            blog: new_blog,
          },
          queryRunner.manager,
        );
      }
      if (result.image.public_id) {
        await this.fileService.markImageAsUsed([result.image.public_id]);
      }

      if (result.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(result.content);
      }
      topic.updated_at = new Date();
      await this.dataSource.getRepository(TopicEntity).save(topic);
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
  async filter(filterData: FilterDto, user?: UserEntity) {
    const { topics = [], search_text, page, limit, rating } = filterData;
    const query = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.topic', 'topic')
      .leftJoin('blog.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.first_name',
        'user.role',
        'user.last_name',
      ]);

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
    if (user.role === ROLES.PARTNER) {
      query.andWhere('blog.created_by = :created_by', {
        created_by: user.id,
      });
    }
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [results, total] = await query.getManyAndCount();

    return {
      total,
      results,
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
      .addOrderBy('blog.created_at', 'DESC')
      // .orderBy('topic.id', 'ASC')
      .getMany();
    const grouped_topics = new_blogs_of_each_topic.reduce((acc, blog) => {
      const topic_id = blog.topic.id;
      if (!acc[topic_id]) {
        acc[topic_id] = [];
      }
      acc[topic_id].push(blog);
      return acc;
    }, {});
    return grouped_topics;
  }

  async findBlogsByTopic(
    slug: string,
    page?: number,
    limit?: number,
    exclude_blog_id?: number,
  ) {
    const query = this.blogRepo
      .createQueryBuilder('blog')
      .orderBy('blog.created_at', 'DESC')
      .leftJoin('blog.topic', 'topic')
      .leftJoin('blog.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.description',
        'user.facebook',
        'user.youtube',
        'user.linkedin',
        'user.instagram',
      ])

      .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])
      .where('topic.slug = :slug', { slug: slug.trim() });

    // .andWhere('blog.is_published = :is_published', {
    //   is_published: true,
    // });

    if (exclude_blog_id) {
      query.andWhere('blog.id != :exclude_blog_id', { exclude_blog_id });
    }
    if (limit && page) {
      query.skip((page - 1) * limit).take(limit);
    }

    return await query.getManyAndCount();
  }

  async findOne(identifier: string) {
    const query = this.blogRepo.createQueryBuilder('blog');
    if (isNumeric(identifier)) {
      query.where('blog.id =:id', { id: +identifier });
    } else {
      query.where('blog.slug ILIKE :slug', { slug: `%${identifier.trim()}%` });
    }

    const blog = await query
      .andWhere('blog.deleted_at IS NULL')
      .leftJoin('blog.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.facebook',
        'user.youtube',
        'user.linkedin',
        'user.instagram',
        'user.description',
      ])
      .leftJoin('blog.topic', 'topic')
      .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])
      .leftJoinAndSelect('blog.faqs', 'faqs')
      .getOne();
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async update(
    user: UserEntity,
    id: number,
    { faqs, ...updateBlogDto }: UpdateBlogDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let topic = null;
      if (updateBlogDto.topic_id) {
        topic = await this.topicService.findOneById(updateBlogDto.topic_id);
      }
      const blog = await this.findOne(id.toString());
      if (!blog) {
        throw new NotFoundException('Blog not found');
      }
      if (blog?.faqs && blog?.faqs?.length !== 0) {
        await this.faqService.deleteFaqs('blog', blog.id, queryRunner.manager);
      }
      if (user.role !== ROLES.ADMIN && blog.user.id !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this blog',
        );
      }
      const data = {
        ...blog,
        ...updateBlogDto,
        ...(topic && { topic }),
      };
      const updated_blog = await this.blogRepo.save(data);

      if (faqs?.length > 0) {
        await this.faqService.saveFaqs(
          faqs,
          {
            blog: updated_blog,
          },
          queryRunner.manager,
        );
      }
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
      if (updated_blog.content) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(
          updated_blog.content,
        );
      }
      await queryRunner.commitTransaction();
      return updated_blog;
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
      const blog = await this.findOne(id.toString());
      if (!blog) {
        throw new NotFoundException('Blog not found ');
      }
      if (user.role !== ROLES.ADMIN && blog.user.id !== user.id) {
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

  async getLatestBlogs(limit: number) {
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
      .take(limit)
      .getMany();
  }

  getTrending(limit: number) {
    return (
      this.blogRepo
        .createQueryBuilder('blog')
        .orderBy('blog.rating', 'DESC')
        .addOrderBy('blog.created_at', 'DESC')
        // .where({
        //   is_published: true,
        // })
        .leftJoin('blog.user', 'user')
        .addSelect([
          'user.id',
          'user.email',
          'user.first_name',
          'user.last_name',
        ])
        .leftJoin('blog.topic', 'topic')
        .addSelect(['topic.id', 'topic.name', 'topic.slug', 'topic.image'])
        .take(limit)
        .getMany()
    );
  }
}
