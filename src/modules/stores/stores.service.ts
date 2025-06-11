import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreDto } from './dto/store.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRep: Repository<StoreEntity>,
  ) {}
  async create(createStoreDto: StoreDto) {
    try {
      const data = this.storeRep.create({
        ...createStoreDto,
        slug: this.makeSlug(createStoreDto.name),
      });
      return await this.storeRep.save(data);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Store already exist');
        }
      } else {
        return error;
      }
    }
  }
  async findAll() {
    const data = await this.storeRep.find();
    if (data) {
      return data.map((store: StoreDto) => ({
        ...store,
        meta_data: this.makeMetaDataContent(store),
      }));
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
    const result = await this.storeRep.update(id, {
      ...updateStoreDto,
      slug: this.makeSlug(updateStoreDto.name),
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

  makeMetaDataContent(data: StoreDto) {
    return {
      title: data.name || '',
      description: data.description || ' ',
      keywords: data.keywords || [],
      url: data.url || '',
      image: data.image_url || '',
      slug: data.slug,
    };
  }

  makeSlug(name: string) {
    return name.toLowerCase().split('').join('-');
  }
}
