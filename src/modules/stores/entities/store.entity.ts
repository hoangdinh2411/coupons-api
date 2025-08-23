import { BaseEntity } from 'common/constants/base.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { FAQEntity } from 'modules/faqs/entities/faq.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('store')
export class StoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 250,
  })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  image: {
    url: string;
    public_id: string;
    file_name: string;
  };

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({
    type: 'int',
    default: 1,
  })
  rating: number;

  @Column({
    type: 'numeric',
    default: 0,
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value, // No transformation needed when saving
      from: (value: string) => parseFloat(value), // Convert from string to number when reading
    },
  })
  max_discount_pct: number;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  keywords: string[];

  @Column({
    type: 'varchar',
    length: 100,
  })
  url: string;

  @Column({
    type: 'varchar',
    length: 250,
    unique: true,
  })
  slug: string;

  @ManyToMany(() => CategoryEntity, (category) => category.stores, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'stores_categories',
    joinColumn: {
      name: 'store_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];

  @OneToMany(() => CouponEntity, (coupon) => coupon.store, {
    eager: false, // keep false unless you always need them
    onDelete: 'CASCADE',
  })
  coupons: CouponEntity[];

  @OneToMany(() => FAQEntity, (faq) => faq.store, {
    eager: false,
    onDelete: 'CASCADE',
  })
  faqs: FAQEntity[];
}
