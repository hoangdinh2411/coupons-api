import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreDto } from './dto/store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { DataSource, ILike, QueryFailedError, Repository } from 'typeorm';
import { CategoriesService } from 'modules/categories/categories.service';
import { FilterDto } from '../../common/constants/filter.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { isNumeric } from 'common/helpers/number';
import { makeMetaDataContent } from 'common/helpers/metadata';
import { FilesService } from 'modules/files/files.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRep: Repository<StoreEntity>,
    private readonly categoryService: CategoriesService,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createStoreDto: StoreDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const category = await this.categoryService.findOneById(
        createStoreDto.category_id,
      );

      const data = this.storeRep.create({ ...createStoreDto, category });
      const result = await this.storeRep.save(data);
      if (result.image !== null) {
        await this.fileService.markImageAsUsed([result.image.public_id]);
      }
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Store already exist');
        }
      } else {
        throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async filter(filterData: FilterDto) {
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
        meta_data: makeMetaDataContent(
          store,
          store.image.url,
          `/stores/${store.slug}`,
        ),
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
            meta_data: makeMetaDataContent(
              store,
              store.image.url,
              `/stores/${store.slug}`,
            ),
          }))
        : [],
    };
  }

  async findOne(identifier: string) {
    const query = this.storeRep.createQueryBuilder('store');
    if (isNumeric(identifier)) {
      query.where('store.id =:id', { id: +identifier });
    } else {
      query.where('store.slug =:slug', { slug: +identifier });
    }

    const store = await query
      .leftJoinAndSelect('store.coupons', 'coupons')
      .leftJoinAndSelect('store.category', 'category')
      .getOne();
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return {
      ...store,
      meta_data: makeMetaDataContent(
        store,
        store.image.url,
        `/stores/${store.slug}`,
      ),
    };
  }

  async findOneById(id: number) {
    const store = await this.storeRep
      .createQueryBuilder('store')
      .where('store.id=:id', {
        id,
      })
      .leftJoinAndSelect('store.coupons', 'coupons')
      .getOne();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      ...store,
      meta_data: makeMetaDataContent(
        store,
        store.image.url,
        `/stores/${store.slug}`,
      ),
    };
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const store = await this.storeRep.findOneBy({
        id,
      });
      if (!store) {
        throw new NotFoundException('Store not found');
      }
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
      await this.storeRep.update(id, data);
      if (
        updateStoreDto.image !== null &&
        updateStoreDto.image.public_id !== store.image.public_id
      ) {
        await this.fileService.delete(store.image.public_id);
        await this.fileService.markImageAsUsed([
          updateStoreDto.image.public_id,
        ]);
      }

      await queryRunner.commitTransaction();
      return {
        id,
        ...updateStoreDto,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Category already exist');
        }
      } else {
        throw error;
      }
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const store = await this.storeRep.findOneBy({
        id,
      });

      if (!store) {
        throw new NotFoundException('Store not found');
      }
      if (store.image !== null) {
        await this.fileService.delete(store.image.public_id);
      }
      await this.storeRep.delete(id);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
