import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from 'modules/categories/categories.service';
import { UserEntity } from 'modules/users/entities/users.entity';
import { isNumeric } from 'common/helpers/number';
import { ROLES } from 'common/constants/enum/roles.enum';
import { BlogsEntity } from './entities/blogs.entity';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogDto } from './dto/blog.dto';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { FilterStoreDto } from 'modules/stores/dto/filter.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogRepo: Repository<BlogsEntity>,
    private readonly categoriesService: CategoriesService,
  ) {}
  async create(user: UserEntity, createBlogDto: BlogDto) {
    const category = await this.categoriesService.findOneById(
      createBlogDto.category_id,
    );
    const new_blog = this.blogRepo.create({
      ...createBlogDto,
      user,
      created_by: user.id,
      category,
    });
    return await this.blogRepo.save(new_blog);
  }
  async filter(filterData: FilterStoreDto) {
    const { categories = [], search_text, page, rating } = filterData;
    const query = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.category', 'category');
    if (search_text) {
      query.andWhere(`blog.name ILIKE :search_text`, {
        search_text: `%${search_text}%`,
      });
    }
    if (rating !== undefined) {
      query.andWhere('blog.rating <= :rating', {
        rating: Number(rating),
      });
    }
    if (categories.length > 0) {
      query.andWhere('blog.category IN (:...categories)', {
        categories,
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
        meta_data: this.makeMetaDataContent(blog),
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

    const data = await query
      .leftJoinAndSelect('blog.user', 'created_by')
      .leftJoinAndSelect('blog.category', 'category')
      .getOne();
    if (!data) {
      throw new NotFoundException('blog not found');
    }
    return {
      ...data,
      meta_data: this.makeMetaDataContent(data),
    };
  }
  async findOneById(id: number) {
    const data = await this.blogRepo.findOneBy({
      id,
    });
    if (!data) {
      throw new NotFoundException('blog not found');
    }

    return data;
  }

  async update(user: UserEntity, id: number, updateBlogDto: UpdateBlogDto) {
    let category = null;
    if (updateBlogDto.category_id) {
      category = await this.categoriesService.findOneById(
        updateBlogDto.category_id,
      );
    }
    const blog = await this.blogRepo.findOne({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!blog) {
      throw new NotFoundException('Store not found');
    }

    if (user.role !== ROLES.ADMIN && blog.created_by !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this blog',
      );
    }
    const data = {
      ...blog,
      ...updateBlogDto,
      ...(category && { category }),
    };

    return await this.blogRepo.save(data);
  }

  async remove(id: number, user: UserEntity) {
    const blog = await this.blogRepo.findOneBy({
      id,
    });
    if (!blog) {
      throw new NotFoundException('blog not found ');
    }
    if (user.role !== ROLES.ADMIN && blog.created_by !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this blog',
      );
    }
    await this.blogRepo.delete(id);
    return true;
  }

  makeMetaDataContent(data: BlogsEntity) {
    return {
      title: data.seo_title || '',
      description: data.seo_description || ' ',
      keywords: data.seo_keywords || [],
      image: data.image_bytes || '',
      slug: data.slug,
    };
  }
}
