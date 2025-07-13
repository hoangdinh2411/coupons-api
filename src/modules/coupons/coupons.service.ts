import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponDto } from './dto/coupon.dt';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponEntity } from './entities/coupon.entity';
import { Brackets, ILike, Repository } from 'typeorm';
import { StoresService } from 'modules/stores/services/stores.service';
import dayjs from 'dayjs';
import { UserEntity } from 'modules/users/entities/users.entity';
import { CategoriesService } from 'modules/categories/categories.service';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { FilterDto } from 'common/constants/filter.dto';
import { CouponStatus, CouponType, ROLES } from 'common/constants/enums';
// import { makeMetaDataContent } from 'common/helpers/metadata';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRep: Repository<CouponEntity>,
    private readonly storeService: StoresService,
    private readonly categoryService: CategoriesService,
  ) {}
  async create(createCouponDto: CouponDto, added_by: UserEntity) {
    const store = await this.storeService.findOneById(createCouponDto.store_id);
    const categories = await this.categoryService.findAllById(
      createCouponDto.categories,
    );

    const payload = {
      ...createCouponDto,
      code:
        createCouponDto.type === CouponType.CODE ? createCouponDto.code : null,
      store,
      categories,
      added_by: added_by.id,
      is_verified: added_by.role === ROLES.ADMIN,
    };

    const new_coupon = this.couponRep.create({
      ...payload,
      store,
      categories,
      added_by: added_by.id,
      is_verified: added_by.role === ROLES.ADMIN,
    });
    return await this.couponRep.save({
      ...new_coupon,
      store: {
        id: store.id,
        name: store.name,
      },
    });
  }

  async submitCoupon(id: number) {
    const data = await this.couponRep.update(
      {
        id,
        is_verified: false,
      },
      {
        is_verified: true,
      },
    );
    if (!data) {
      throw new NotFoundException('Coupon not found');
    }
    return true;
  }

  async findAll(
    page: number,
    search_text: string,
    is_verified: boolean = true,
  ) {
    const query = this.couponRep
      .createQueryBuilder('coupon')
      .where('coupon.is_verified = :is_verified', {
        is_verified,
      });

    query.skip((page - 1) * LIMIT_DEFAULT).take(LIMIT_DEFAULT);
    if (search_text) {
      query.andWhere({
        code: ILike(`%${search_text}%`),
      });
    }

    const [results, total] = await query
      .leftJoinAndSelect('coupon.store', 'store')
      .leftJoinAndSelect('coupon.categories', 'categories')
      .orderBy('coupon.expire_date', 'DESC')
      .getManyAndCount();

    return {
      results: results.map((c) => ({
        ...c,
        // meta_data: makeMetaDataContent(c, '', '/coupons/' + c.id),
      })),
      total,
    };
  }

  async filter(data: FilterDto) {
    const {
      categories = [],
      status = [],
      stores = [],
      search_text = '',
      page = 1,
      rating,
      is_verified,
    } = data;
    const query = this.couponRep.createQueryBuilder('cp');

    if (search_text) {
      query.andWhere(
        `cp.title ILIKE :search_text OR cp.code ILIKE :search_text`,
        {
          search_text: `%${search_text}%`,
        },
      );
    }
    query.andWhere('cp.is_verified = :is_verified', {
      is_verified,
    });
    if (rating !== undefined) {
      query.andWhere('cp.rating <= :rating', {
        rating: Number(rating),
      });
    }
    if (status.length) {
      const now = dayjs().format('YYYY/MM/DD');
      query.andWhere(
        new Brackets((qb1) => {
          if (status.includes(CouponStatus.INACTIVE)) {
            qb1.orWhere('cp.start_date > :now', { now });
          }
          if (status.includes(1)) {
            qb1.orWhere('cp.start_date <= :now AND cp.expire_date >= :now', {
              now,
            });
          }
          if (status.includes(2)) {
            qb1.orWhere('cp.expire_date < :now', { now });
          }
        }),
      );
    }

    if (stores.length > 0) {
      query.andWhere('cp.store_id IN (:...stores)', {
        stores,
      });
      // .addSelect(['s.name']);
    }
    if (categories.length > 0) {
      query
        .leftJoin('cp.categories', 'category')
        .andWhere('category.id  IN (:...categories)', {
          categories,
        });
    }

    const [results, total] = await query
      .skip((page - 1) * LIMIT_DEFAULT)
      .take(LIMIT_DEFAULT)
      .leftJoinAndSelect('cp.store', 'store')
      .leftJoinAndSelect('cp.categories', 'categories')
      .getManyAndCount();

    return {
      results: results.map((c) => ({
        ...c,
        // meta_data: makeMetaDataContent(c),
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
      .leftJoinAndSelect('coupon.categories', 'categories')
      .getOne();
    if (!data) {
      throw new NotFoundException('Coupon not found');
    }
    return {
      ...data,
      //  meta_data: makeMetaDataContent(data)
    };
  }

  async update(id: number, updateCouponDto: UpdateCouponDto, user: UserEntity) {
    let store = null;
    if (updateCouponDto.store_id) {
      store = await this.storeService.findOneById(updateCouponDto.store_id);
    }
    let categories = [];

    if (updateCouponDto.categories) {
      categories = await this.categoryService.findAllById(
        updateCouponDto.categories,
      );
    }
    const coupon = await this.couponRep.findOneBy({
      id,
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (user.role !== ROLES.ADMIN && coupon.added_by !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this coupon',
      );
    }
    const payload = {
      ...coupon,
      ...updateCouponDto,
      code:
        updateCouponDto.type === CouponType.CODE ? updateCouponDto.code : null,
      ...(store && { store }),
      ...(categories && { categories }),
    };

    await this.couponRep.save(payload);

    return {
      id: coupon.id,
      ...payload,
    };
  }

  async remove(id: number, user: UserEntity) {
    const coupon = await this.couponRep.findOneBy({
      id,
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (user.role !== ROLES.ADMIN && coupon.added_by !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this coupon',
      );
    }
    await this.couponRep.delete(id);
    return true;
  }
}
