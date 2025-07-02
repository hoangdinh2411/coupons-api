import { Injectable } from '@nestjs/common';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { TopicEntity } from 'modules/topic/entities/topic.entity';
import { DataSource, ILike } from 'typeorm';

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
        take: LIMIT_DEFAULT,
        select: ['name', 'slug', 'id'],
      });
    const popular = popular_stores.sort((a, b) => a.name.localeCompare(b.name));
    const categories = await this.dataSource
      .getRepository(CategoryEntity)
      .find({
        order: {
          name: 'ASC',
        },
        take: LIMIT_DEFAULT,
        select: ['name', 'id', 'slug', 'stores'],
      });
    const categories_with_limited_store = await Promise.all(
      categories.map(async (cat) => {
        const stores = await this.dataSource
          .getRepository(StoreEntity)
          .createQueryBuilder('store')
          .innerJoin('store.categories', 'category')
          .where('category.id = :id', { id: cat.id })
          .orderBy('store.name', 'ASC')
          .select(['store.id', 'store.name', 'store.slug'])
          .limit(LIMIT_DEFAULT)
          .getMany();
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          stores,
        };
      }),
    );

    return {
      popular,
      categories: categories_with_limited_store,
    };
  }
  async getAllCategoryWithAllStore() {
    const categories = await this.dataSource
      .getRepository(CategoryEntity)
      .createQueryBuilder('category')
      .select(['category.id', 'category.name', 'category.slug'])
      .leftJoin('category.stores', 'store')
      .addSelect(['store.id', 'store.name', 'store.slug'])
      .orderBy('category.name', 'ASC')
      .addOrderBy('store.name', 'ASC')
      .getMany();
    return categories;
  }

  async getTopics() {
    return await this.dataSource
      .getRepository(TopicEntity)
      .createQueryBuilder('topic')
      .addOrderBy('topic.name', 'ASC')
      .select(['topic.id', 'topic.name', 'topic.slug'])
      .getMany();
  }
  async getLatestBlogs() {
    return await this.dataSource
      .getRepository(TopicEntity)
      .createQueryBuilder('topic')
      .addOrderBy('topic.name', 'ASC')
      .select(['topic.id', 'topic.name', 'topic.slug'])
      .getMany();
  }

  async getStores(first_letter: string, search_text: string = '') {
    const query = this.dataSource
      .getRepository(StoreEntity)
      .createQueryBuilder('store');
    if (search_text !== '') {
      query
        .andWhere({
          name: ILike(`%${search_text}%`),
        })
        .take(LIMIT_DEFAULT);
    } else {
      query.andWhere(`store.name ILIKE :first_letter`, {
        first_letter: `${first_letter}%`,
      });
    }

    return await query
      .orderBy('name', 'ASC')
      .select(['store.name', 'store.id', 'store.slug', 'store.url'])
      .getMany();
  }
}
