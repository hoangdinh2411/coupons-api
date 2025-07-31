import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PageEntity } from 'modules/pages/entities/page.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';

@Entity('faq')
export class FAQEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 250,
  })
  question: string;

  @Column({
    type: 'text',
  })
  answer: string;

  @Column({
    type: 'int',
    default: 0,
  })
  order: number;

  @ManyToOne(() => StoreEntity, (store) => store.faqs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @ManyToOne(() => PageEntity, (store) => store.faqs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  pages: StoreEntity;
}
