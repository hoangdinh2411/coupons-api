import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreDto } from './dto/store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { CategoriesService } from 'modules/categories/categories.service';
import { FilterStoreDto } from './dto/filter.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { LIMIT_DEFAULT } from 'common/constants/variables';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRep: Repository<StoreEntity>,
    private readonly categoryService: CategoriesService,
  ) {}
  async create(createStoreDto: StoreDto) {
    try {
      const category = await this.categoryService.findOneById(
        createStoreDto.category_id,
      );

      const data = this.storeRep.create({ ...createStoreDto, category });
      return await this.storeRep.save(data);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Store already exist');
        }
      } else {
        throw error;
      }
    }
  }

  async filter(filterData: FilterStoreDto) {
    const {
      categories = [],
      max_discount_pct = 100,
      search_text,
      page,
      rating,
    } = filterData;
    const query = this.storeRep
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.category', 'category');
    if (search_text) {
      query.andWhere(`store.name ILIKE :search_text`, {
        search_text: `%${search_text}%`,
      });
    }
    if (rating !== undefined) {
      query.andWhere('store.rating <= :rating', {
        rating: Number(rating),
      });
    }
    if (categories.length > 0) {
      query.andWhere('store.category IN (:...categories)', {
        categories,
      });
    }

    if (max_discount_pct) {
      query.andWhere('store.max_discount_pct <= :max_discount_pct', {
        max_discount_pct,
      });
    }

    const [results, total] = await query
      .skip((page - 1) * LIMIT_DEFAULT)
      .take(LIMIT_DEFAULT)
      .getManyAndCount();

    return {
      total,
      results: results.map((store: StoreEntity) => ({
        ...store,
        meta_data: this.makeMetaDataContent(store),
      })),
    };
  }
  async findAll(limit: number, page: number, search_text: string) {
    const query = this.storeRep.createQueryBuilder('store');

    if (limit && page) {
      query.skip((page - 1) * limit).take(limit);
    }
    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }

    const [results, total] = await query
      .leftJoinAndSelect('store.coupons', 'coupons')
      .leftJoinAndSelect('store.category', 'category')
      .getManyAndCount();
    return {
      total,
      results: results
        ? results.map((store: StoreEntity) => ({
            ...store,
            meta_data: this.makeMetaDataContent(store),
          }))
        : [],
    };
  }

  async findOneBySlug(identifier: string) {
    const query = this.storeRep.createQueryBuilder('store');
    if (this.isNumeric(identifier)) {
      query.where('store.id =:id', { id: +identifier });
    } else {
      query.where('store.slug =:slug', { slug: +identifier });
    }

    const data = await query
      .leftJoinAndSelect('store.coupons', 'coupons')
      .leftJoinAndSelect('store.category', 'category')
      .getOne();
    if (!data) {
      throw new NotFoundException('Store not found');
    }
    return {
      ...data,
      meta_data: this.makeMetaDataContent(data),
    };
  }

  isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }
  async findOneById(id: number) {
    const data = await this.storeRep
      .createQueryBuilder('store')
      .where('store.id=:id', {
        id,
      })
      .leftJoinAndSelect('store.coupons', 'coupons')
      .getOne();
    if (!data) {
      throw new NotFoundException('Store not found');
    }

    return {
      ...data,
      meta_data: this.makeMetaDataContent(data),
    };
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    let category = null;
    if (updateStoreDto.category_id) {
      category = await this.categoryService.findOneById(
        updateStoreDto.category_id,
      );
    }
    const data = {
      ...updateStoreDto,
      ...(category && { category }),
    };
    const result = await this.storeRep.update(id, data);
    if (result.affected === 0) {
      throw new NotFoundException('Store not found');
    }
    return {
      id,
      ...data,
    };
  }

  async remove(id: number) {
    const result = await this.storeRep.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Store not found');
    }
    return true;
  }

  makeMetaDataContent(data: StoreEntity) {
    return {
      title: data.name || '',
      description: data.description || ' ',
      keywords: data.keywords || [],
      image: data.image_bytes || '',
      slug: data.slug,
    };
  }
}
