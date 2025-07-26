import { Injectable } from '@nestjs/common';
import { CouponType } from 'common/constants/enums';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
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
    const top_categories = await this.dataSource
      .getRepository(CategoryEntity)
      .createQueryBuilder('category')
      .leftJoin('category.coupons', 'coupon')
      .addSelect('COUNT(coupon.id)', 'total_coupons')
      .groupBy('category.id')
      .orderBy('total_coupons', 'DESC')
      .take(5)
      .getMany();
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
          .select(['store.id', 'store.name', 'store.slug'])
          .innerJoin('store.categories', 'category')
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
      top_categories,
      popular,
      categories: categories_with_limited_store,
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
    if (!page) page = 1;
    return await this.dataSource
      .getRepository(CouponEntity)
      .createQueryBuilder('coupon')
      .innerJoin('coupon.categories', 'category')
      .leftJoinAndSelect('coupon.store', 'store')
      .where('category.id =:category_id', { category_id })
      .orderBy('store.rating', 'DESC')
      .skip((page - 1) * LIMIT_DEFAULT)
      .take(LIMIT_DEFAULT)
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
}
