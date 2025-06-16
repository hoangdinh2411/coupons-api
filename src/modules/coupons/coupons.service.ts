import { Injectable, NotFoundException } from '@nestjs/common';
import { CouponDto } from './dto/coupon.dt';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponEntity } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { StoresService } from 'modules/stores/stores.service';
import dayjs from 'dayjs';
import { FilterCouponDto } from './dto/filter.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRep: Repository<CouponEntity>,
    private readonly storeService: StoresService,
  ) {}
  async create(createCouponDto: CouponDto) {
    const store = await this.storeService.findOne(createCouponDto.store);
    const new_coupon = this.couponRep.create({
      ...createCouponDto,
      store,
    });
    await this.couponRep.save(new_coupon);
    return true;
  }

  async findAll() {
    const [results, total] = await this.couponRep
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.store', 'store')
      .orderBy('coupon.expire_date', 'DESC')
      .getManyAndCount();
    return {
      results: results.map((c) => ({
        ...c,
        meta_data: this.makeMetaDataContent(c),
      })),
      total,
    };
  }
  async filter(data: FilterCouponDto) {
    const {
      categories = [],
      expire_date,
      store = '',
      tags = [],
      title = '',
    } = data;
    const query = this.couponRep.createQueryBuilder('cp');

    if (title) {
      query.andWhere(`cp.title ILIKE :kw OR cp.offer_detail ILIKE :kw`, {
        kw: `%${title}%`,
      });
    }

    if (expire_date) {
      query.andWhere('cp.expire_date <= :expire_date', {
        expire_date: dayjs(expire_date, 'YYYY-MM-DD'),
      });
    }

    if (store) {
      query.leftJoin('cp.store', 's').andWhere('s.id = :store', {
        store,
      });
      // .addSelect(['s.name']);

      if (categories.length > 0) {
        query
          .leftJoin('s.category', 'c')
          .andWhere('c.id  IN (:...categories)', {
            categories,
          });
        // .addSelect(['c.name']);
      }
      if (tags) {
        query.andWhere(
          'EXISTS (SELECT 1 FROM unnest(s.keywords) AS kw WHERE kw ILIKE ANY(:tags))',
          {
            tags,
          },
        );
      }
    }

    const [results, total] = await query.getManyAndCount();

    return {
      results: results.map((c) => ({
        ...c,
        meta_data: this.makeMetaDataContent(c),
      })),
      total,
    };
  }

  async findOne(id: number) {
    const data = await this.couponRep
      .createQueryBuilder('coupon')
      .where('coupon.id=:id', {
        id,
      })
      .leftJoinAndSelect('coupon.store', 'store')
      .getOne();
    if (!data) {
      throw new NotFoundException('Coupon not found');
    }
    return { ...data, meta_data: this.makeMetaDataContent(data) };
  }

  async update(id: number, updateCouponDto: CouponDto) {
    const store = await this.storeService.findOne(updateCouponDto.store);
    const result = await this.couponRep.update(id, {
      ...updateCouponDto,
      store,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Coupon not found');
    }
    return true;
  }

  async remove(id: number) {
    const result = await this.couponRep.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Coupon not found');
    }
    return true;
  }
  makeMetaDataContent(data: CouponEntity) {
    return {
      title: data.title || '',
      description: data.offer_detail || ' ',
      keywords: data.store.keywords || [],
      image: data.store.image_bytes || '',
      slug: `${data.store.slug}/${data.id}`,
    };
  }
}
