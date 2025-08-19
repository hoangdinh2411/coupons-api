import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FAQEntity } from '../entities/faq.entity';
import { FAQDto } from '../dto/faq.dto';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { PageEntity } from 'modules/pages/entities/page.entity';

@Injectable()
export class FAQService {
  constructor(
    @InjectRepository(FAQEntity)
    private readonly faqRep: Repository<FAQEntity>,
  ) {}
  async saveFaqs(
    data: FAQDto[],
    payload: {
      store?: StoreEntity;
      category?: CategoryEntity;
      blog?: BlogsEntity;
      page?: PageEntity;
    },
    manager: EntityManager,
  ) {
    try {
      const faqs = data.map((f, index) => ({
        ...f,
        order: index + 1,
        ...payload,
      }));
      await manager.save(FAQEntity, faqs);
    } catch (error) {
      throw error;
    }
  }

  async deleteFaqs(
    key: 'store' | 'category' | 'blog' | 'page',
    id: number,
    manager: EntityManager,
  ) {
    try {
      const query = manager.createQueryBuilder().delete().from(FAQEntity);

      if (key === 'store') {
        query.where('store_id = :store_id', { store_id: id });
      }

      if (key === 'category') {
        query.where('category_id = :category_id', { category_id: id });
      }
      if (key === 'blog') {
        query.where('blog_id = :blog_id', { blog_id: id });
      }

      const result = await query.execute();
      if (result.affected === 0) {
        throw new ConflictException(`Cannot delete FAQs by ${key} id ` + id);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
