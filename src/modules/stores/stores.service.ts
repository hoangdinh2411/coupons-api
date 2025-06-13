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
        createStoreDto.category,
      );

      const data = this.storeRep.create({ ...createStoreDto, category });
      await this.storeRep.save(data);
      return;
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
      tags = [],
      max_discount_pct = 100,
      name,
    } = filterData;
    const queryBuilder = this.storeRep
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.category', 'category');
    if (name) {
      queryBuilder.andWhere({
        name: ILike(`%${name}%`),
      });
    }

    if (categories.length > 0) {
      queryBuilder.andWhere('store.category IN (:...categories)', {
        categories,
      });
    }
    if (tags.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(store.keywords) AS kw WHERE kw ILIKE ANY(:tags))',
        {
          tags,
        },
      );
    }
    if (max_discount_pct) {
      queryBuilder.andWhere('store.max_discount_pct <= :max_discount_pct', {
        max_discount_pct,
      });
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      results,
    };
  }
  async findAll(limit: number, page: number) {
    const [results, total] = await this.storeRep
      .createQueryBuilder('store')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    if (total > 0) {
      return {
        total,
        results: results.map((store: StoreEntity) => ({
          ...store,
          meta_data: this.makeMetaDataContent(store),
        })),
      };
    } else {
      return [];
    }
  }

  async findOne(id: number) {
    const data = await this.storeRep.findOneBy({
      id,
    });
    if (!data) {
      throw new NotFoundException('Store not found');
    }
    return {
      ...data,
      meta_data: this.makeMetaDataContent(data),
    };
  }

  async update(id: number, updateStoreDto: StoreDto) {
    const category = await this.categoryService.findOneById(
      updateStoreDto.category,
    );
    const result = await this.storeRep.update(id, {
      ...updateStoreDto,
      category,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Store not found');
    }
    return true;
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
      url: data.url || '',
      image: data.image_bytes || '',
      slug: data.slug,
    };
  }

  makeSlug(name: string) {
    return name.toLowerCase().split('').join('-');
  }
}
