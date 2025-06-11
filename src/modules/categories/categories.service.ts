import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRep: Repository<CategoryEntity>,
  ) {}
  async create(createCategoryDto: CategoryDto) {
    try {
      const data = this.categoryRep.create(createCategoryDto);
      return await this.categoryRep.save(data);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Category already exist');
        }
      } else {
        return error;
      }
    }
  }

  findAll() {
    return this.categoryRep.find();
  }

  async findOne(id: number) {
    const data = await this.categoryRep.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('Category not found');
    }
    return data;
  }

  async update(id: number, updateCategoryDto: CategoryDto) {
    const result = await this.categoryRep.update(id, updateCategoryDto);
    if (result.affected === 0) {
      throw new NotFoundException('Category not found');
    }
    return true;
  }

  async remove(id: number) {
    const result = await this.categoryRep.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Category not found');
    }
    return true;
  }
}
