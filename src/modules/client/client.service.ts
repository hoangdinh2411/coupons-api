import { Injectable } from '@nestjs/common';
import { CouponType } from 'common/constants/enums';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { TopicEntity } from 'modules/topic/entities/topic.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ClientService {
  constructor(private readonly dataSource: DataSource) {}
  async getMenu() {
    const popular_stores = await this.dataSource
      .getRepository(StoreEntity)
      .find({
        order: {
          rating: 'DESC',
        },
        take: 20,
        relations: ['categories'],
        select: ['name', 'id', 'slug', 'rating'],
      });
    const popular = popular_stores.sort((a, b) => a.name.localeCompare(b.name));
    const top_categories = await this.dataSource
      .getRepository(CategoryEntity)
      .createQueryBuilder('category')
      .leftJoin('category.coupons', 'coupon')
      .addSelect('COUNT(coupon.id)', 'total_coupons')
      .groupBy('category.id')
      .orderBy('total_coupons', 'DESC')
      .take(10)
      .getMany();

    const categories_with_limited_store = await Promise.all(
      top_categories.map(async (cat) => {
        const stores = await this.dataSource
          .getRepository(StoreEntity)
          .createQueryBuilder('store')
          .select(['store.id', 'store.name', 'store.slug', 'store.rating'])
          .innerJoin('store.categories', 'category')
          .where('category.id = :id', { id: cat.id })
          .orderBy('store.rating', 'DESC')
          .take(10)
          .getMany();
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          stores,
        };
      }),
    );
    const top_topic = await this.dataSource
      .getRepository(TopicEntity)
      .createQueryBuilder('topic')
      .leftJoin('topic.blogs', 'blog')
      .addSelect('COUNT(blog.id)', 'total_blogs')
      .groupBy('topic.id')
      .orderBy('total_blogs', 'DESC')
      .take(5)
      .getMany();

    const topic_with_limited_blogs = await Promise.all(
      top_topic.map(async (topic) => {
        const blogs = await this.dataSource
          .getRepository(BlogsEntity)
          .createQueryBuilder('blog')
          .select(['blog.id', 'blog.title', 'blog.slug', 'blog.updated_at'])
          .innerJoin('blog.topic', 'topic')
          .where('topic.id = :id', { id: topic.id })
          .orderBy('blog.updated_at', 'DESC')
          .take(5)
          .getMany();
        return {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          blogs,
        };
      }),
    );
    return {
      top_categories: categories_with_limited_store,
      popular,
      top_topic: topic_with_limited_blogs,
    };
  }

  async countCouponsByCategory(category_id: number) {
    return await this.dataSource
      .getRepository(CouponEntity)
      .createQueryBuilder('coupon')
      .innerJoin('coupon.categories', 'category')
      .where('category.id =:category_id', { category_id })
      .select('COUNT(*)', 'total_coupons')
      .addSelect(
        `COUNT(*) FILTER (WHERE coupon.type = '${CouponType.CODE}')`,
        'total_coupon_codes',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE coupon.type = '${CouponType.ONLINE_AND_IN_STORE}')`,
        'total_in_store_coupons',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE coupon.type = '${CouponType.SALE}')`,
        'total_sale_coupons',
      )
      .getRawOne();
  }
  async getCouponsByCategory(category_id: number, page: number) {
    const limit = 24;
    if (!page) page = 1;
    return await this.dataSource
      .getRepository(CouponEntity)
      .createQueryBuilder('coupon')
      .innerJoin('coupon.categories', 'category')
      .leftJoinAndSelect('coupon.store', 'store')
      .where('category.id =:category_id', { category_id })
      .orderBy('store.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }
  async getSimilarStoresByCategory(category_id: number) {
    return await this.dataSource
      .getRepository(StoreEntity)
      .createQueryBuilder('store')
      .select([
        'store.id',
        'store.name',
        'store.rating',
        'store.slug',
        'category.id',
      ])
      .innerJoin('store.categories', 'category')
      .where('category.id =:category_id', { category_id })
      .orderBy('store.rating', 'DESC')
      .take(LIMIT_DEFAULT)
      .getMany();
  }

  async getTopStoreToday(category_id?: number | null, limit?: number) {
    const query = this.dataSource
      .getRepository(StoreEntity)
      .createQueryBuilder('store')
      .select(['store.id', 'store.name', 'store.slug', 'store.updated_at']);
    if (category_id !== null) {
      query
        .addSelect(['category.id'])
        .innerJoin('store.categories', 'category')
        .where('category.id =:category_id', { category_id });
    }
    const store = await query
      .orderBy('store.updated_at', 'DESC')
      .take(limit)
      .getMany();
    return store;
  }
}
