import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreDto } from '../dto/store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from '../entities/store.entity';
import { DataSource, ILike, QueryFailedError, Repository } from 'typeorm';
import { CategoriesService } from 'modules/categories/categories.service';
import { FilterDto } from '../../../common/constants/filter.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { LIMIT_DEFAULT } from 'common/constants/variables';
import { isNumeric } from 'common/helpers/number';
import { makeMetaDataContent } from 'common/helpers/metadata';
import { FilesService } from 'modules/files/files.service';
import { FAQService } from './faqs.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRep: Repository<StoreEntity>,
    private readonly faqService: FAQService,
    private readonly categoryService: CategoriesService,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createStoreDto: StoreDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const categories = await this.categoryService.findAllById(
        createStoreDto.categories,
      );

      const store = this.storeRep.create({ ...createStoreDto, categories });
      await this.storeRep.save(store);
      if (createStoreDto.faqs) {
        await this.faqService.saveFaqs(
          createStoreDto.faqs,
          store,
          queryRunner.manager,
        );
      }
      if (store) {
        await this.fileService.markImageAsUsed([store.image.public_id]);
      }
      if (store.description) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(
          store.description,
        );
      }
      await queryRunner.commitTransaction();
      return store;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Slug already exists');
        }
      }
      throw error;
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
    const query = this.storeRep.createQueryBuilder('store');
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
      query
        .leftJoin('store.categories', 'category')
        .andWhere('category.id IN (:...categories)', {
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
      .leftJoinAndSelect('store.categories', 'categories')
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
  async findAll(page: number, search_text: string) {
    const query = this.storeRep.createQueryBuilder('store');

    if (page) {
      query.skip((page - 1) * LIMIT_DEFAULT).take(LIMIT_DEFAULT);
    }
    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }

    const [results, total] = await query
      .leftJoinAndSelect('store.coupons', 'coupons')
      .leftJoinAndSelect('store.categories', 'categories')
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
      query.where('store.slug ILIKE :slug', { slug: `%${identifier}%` });
    }

    const store = await query
      .leftJoinAndSelect('store.coupons', 'coupons')
      .leftJoinAndSelect('store.categories', 'categories')
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
      let categories = [];
      if (updateStoreDto.categories) {
        categories = await this.categoryService.findAllById(
          updateStoreDto.categories,
        );
      }
      if (store.faqs) {
        await this.faqService.deleteFaqs(store.id, queryRunner.manager);
      }

      const data = {
        ...store,
        ...updateStoreDto,
        ...(categories && { categories }),
      };
      const updated_store = await this.storeRep.save(data);
      const has_new_image =
        updateStoreDto.image &&
        updateStoreDto.image.public_id &&
        updateStoreDto.image.public_id !== store.image.public_id;

      if (has_new_image) {
        await this.fileService.markImageAsUsed([
          updateStoreDto.image.public_id,
        ]);
      }
      if (has_new_image && store.image.public_id !== '') {
        await this.fileService.delete(store.image.public_id);
      }
      if (updated_store.description) {
        await this.fileService.updateTagsFOrUsedImagesFromHtml(
          updated_store.description,
        );
      }
      if (updateStoreDto.faqs) {
        await this.faqService.saveFaqs(
          updateStoreDto.faqs,
          updated_store,
          queryRunner.manager,
        );
      }
      await queryRunner.commitTransaction();
      return updated_store;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Slug already exists');
        }
      }
      throw error;
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
      if (store.image.public_id) {
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

  async findStoreForClient(first_letter: string, search_text: string = '') {
    const query = this.storeRep.createQueryBuilder('store');
    if (search_text) {
      query
        .andWhere({
          name: ILike(`%${search_text}%`),
        })
        .take(LIMIT_DEFAULT);
    }
    if (first_letter) {
      const number_regex = /^[0-9]/;
      if (number_regex.test(first_letter)) {
        query.andWhere(`store.name ~ '^[0-9]'`);
      } else {
        query.andWhere({
          name: ILike(`${first_letter}%`),
        });
      }
    }

    return await query
      .orderBy('name', 'ASC')
      .select(['store.name', 'store.id', 'store.slug', 'store.url'])
      .getMany();
  }
}
