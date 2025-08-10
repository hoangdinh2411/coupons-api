import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, QueryFailedError, Repository } from 'typeorm';
import { FilesService } from 'modules/files/files.service';
import { isNumeric } from 'common/helpers/number';
import { FAQService } from 'modules/faqs/services/faqs.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRep: Repository<CategoryEntity>,
    private readonly fileService: FilesService,
    private readonly faqService: FAQService,
    private readonly dataSource: DataSource,
  ) {}
  async create({ faqs, ...createCategoryDto }: CategoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const new_category = this.categoryRep.create(createCategoryDto);
      await this.categoryRep.save(new_category);
      if (new_category.image.public_id) {
        await this.fileService.markImageAsUsed([new_category.image.public_id]);
      }

      if (faqs) {
        await this.faqService.saveFaqs(
          faqs,
          {
            category: new_category,
          },
          queryRunner.manager,
        );
      }
      await queryRunner.commitTransaction();
      return new_category;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Category already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page?: number, limit?: number, search_text?: string) {
    const query = this.categoryRep.createQueryBuilder('category');
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }

    const [categories, total] = await query.getManyAndCount();
    const ids = categories.map((c) => c.id);
    const results = await this.categoryRep
      .createQueryBuilder('category')
      .whereInIds(ids)
      .leftJoin('category.stores', 'store')
      .addSelect(['store.id', 'store.name', 'store.slug'])
      .leftJoinAndSelect('category.faqs', 'faqs')
      .orderBy('category.name', 'ASC')
      .addOrderBy('store.name', 'ASC')
      .addOrderBy('faqs.order', 'ASC')
      .getMany();
    return {
      total,
      results,
    };
  }

  async findOne(identifier: string) {
    const query = this.categoryRep.createQueryBuilder('c');
    if (isNumeric(identifier)) {
      query.where('c.id =:id', { id: +identifier });
    } else {
      query.where('c.slug ILIKE :slug', { slug: `%${identifier}%` });
    }
    const category = await query.getOne();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
  async findOneBySlugWithCoupons(slug: string) {
    const data = await this.categoryRep
      .createQueryBuilder('c')
      .where('c.slug=:slug', { slug })
      .loadRelationCountAndMap('c.total_coupons', 'c.coupons')
      .getOne();
    if (!data) {
      throw new NotFoundException('Category not found');
    }
    return data;
  }

  async update(id: number, updateCategoryDto: CategoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const category = await this.categoryRep.findOne({
        where: {
          id,
        },
        relations: ['faqs'],
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      const { faqs, ...dtoWithoutFaqs } = updateCategoryDto;
      const data = {
        ...category,
        ...dtoWithoutFaqs,
      };
      if (category?.faqs && category?.faqs?.length !== 0) {
        await this.faqService.deleteFaqs(
          'category',
          category.id,
          queryRunner.manager,
        );
      }
      const new_category = await this.categoryRep.save(data);

      if (faqs?.length > 0) {
        await this.faqService.saveFaqs(
          faqs,
          {
            category: new_category,
          },
          queryRunner.manager,
        );
      }

      const has_new_image =
        updateCategoryDto.image &&
        updateCategoryDto.image.public_id &&
        updateCategoryDto.image.public_id !== category.image.public_id;
      if (has_new_image) {
        await this.fileService.markImageAsUsed([
          updateCategoryDto.image.public_id,
        ]);
      }
      if (has_new_image && category.image.public_id !== '') {
        await this.fileService.delete(category.image.public_id);
      }

      await queryRunner.commitTransaction();
      return new_category;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Category already exist');
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllById(ids: number[]) {
    return await this.categoryRep.find({
      where: {
        id: In(ids),
      },
    });
  }
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const category = await this.categoryRep.findOneBy({
        id,
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
      if (category.image.public_id) {
        await this.fileService.delete(category.image.public_id);
      }
      await this.categoryRep.delete(category.id);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCategoriesHasMostCoupons() {
    return await this.categoryRep
      .createQueryBuilder('category')
      .leftJoin('category.coupons', 'coupons')
      .loadRelationCountAndMap('category.total_coupons', 'category.coupons')
      .orderBy('category.total_coupons', 'DESC')
      .take(5)
      .getMany();
  }
}
