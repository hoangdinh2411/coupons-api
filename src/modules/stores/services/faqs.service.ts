import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreEntity } from '../entities/store.entity';
import { EntityManager, Repository } from 'typeorm';
import { FAQEntity } from '../entities/faq.entity';
import { FAQDto } from '../dto/faq.dto';

@Injectable()
export class FAQService {
  constructor(
    @InjectRepository(FAQEntity)
    private readonly faqRep: Repository<FAQEntity>,
  ) {}
  async saveFaqs(data: FAQDto[], store: StoreEntity, manager: EntityManager) {
    try {
      const faqs = data.map((f, index) => ({
        ...f,
        order: index + 1,
        store,
      }));
      await manager.save(FAQEntity, faqs);
    } catch (error) {
      throw error;
    }
  }

  async deleteFaqs(store_id: number, manager: EntityManager) {
    try {
      const result = await manager
        .createQueryBuilder()
        .delete()
        .from(FAQEntity)
        .where('store_id = :storeId', { storeId: store_id })
        .execute();

      if (result.affected === 0) {
        throw new ConflictException(
          'Cannot delete FAQs by store id ' + store_id,
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
