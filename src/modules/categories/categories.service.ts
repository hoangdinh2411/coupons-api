import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, QueryFailedError, Repository } from 'typeorm';
import { FilesService } from 'modules/files/files.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRep: Repository<CategoryEntity>,
    private readonly fileService: FilesService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createCategoryDto: CategoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const new_category = this.categoryRep.create(createCategoryDto);
      const result = await this.categoryRep.save(new_category);
      if (result.image.public_id) {
        await this.fileService.markImageAsUsed([result.image.public_id]);
      }
      await queryRunner.commitTransaction();
      return result;
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

  async findAll(limit: number, page: number, search_text: string) {
    const query = this.categoryRep.createQueryBuilder('category');
    if (limit && page) {
      query.skip((page - 1) * limit).take(limit);
    }

    if (search_text) {
      query.andWhere({
        name: ILike(`%${search_text}%`),
      });
    }

    const [results, total] = await query.getManyAndCount();
    return {
      total,
      results,
    };
  }
  async search(search_text: string) {
    const [results, total] = await this.categoryRep
      .createQueryBuilder('category')
      .where({
        name: ILike(`%${search_text}%`),
      })
      .getManyAndCount();
    return {
      total,
      results,
    };
  }

  async findOneById(id: number) {
    const data = await this.categoryRep.findOneBy({ id });
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
      const category = await this.categoryRep.findOneBy({
        id,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const result = await this.categoryRep.update(id, updateCategoryDto);
      if (result.affected === 0) {
        throw new InternalServerErrorException('Cannot update category');
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
      return {
        id,
        ...updateCategoryDto,
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
}
