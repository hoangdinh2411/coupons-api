import { BaseEntity } from 'common/constants/base.entity';
import { FAQEntity } from 'modules/faqs/entities/faq.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('page')
export class PageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  type: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  images: {
    url: string;
    public_id: string;
    file_name: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  thumbnail: {
    url: string;
    public_id: string;
    file_name: string;
  };

  @OneToMany(() => FAQEntity, (faq) => faq.page, {
    cascade: true, // optional: saves coupons when you save a store
    eager: false,
  })
  faqs: FAQEntity[];
}
