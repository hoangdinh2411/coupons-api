import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StoreEntity } from './store.entity';

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
  store: StoreEntity;
}
