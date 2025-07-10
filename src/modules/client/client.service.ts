import { Injectable } from '@nestjs/common';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
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
        take: LIMIT_DEFAULT,
        relations: ['categories'],
        select: ['name', 'id', 'slug', 'rating'],
      });
    const popular = popular_stores.sort((a, b) => a.name.localeCompare(b.name));
    const categories = await this.dataSource
      .getRepository(CategoryEntity)
      .find({
        order: {
          name: 'ASC',
        },
        select: ['name', 'id', 'slug'],
      });
    const categories_with_limited_store = await Promise.all(
      categories.map(async (cat) => {
        const stores = await this.dataSource
          .getRepository(StoreEntity)
          .createQueryBuilder('store')
          .innerJoin('store.categories', 'category')
          .addSelect(['store.name', 'store.id', 'store.slug'])
          .where('category.id = :id', { id: cat.id })
          .orderBy('store.name', 'ASC')
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
}
