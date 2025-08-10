import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PageEntity } from 'modules/pages/entities/page.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';

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
    nullable: true,
  })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.faqs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => PageEntity, (page) => page.faqs, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'page_id' })
  page: StoreEntity;
}
