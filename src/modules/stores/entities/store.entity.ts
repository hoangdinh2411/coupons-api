import { BaseEntity } from 'common/constants/base.entity';
import { generateSlug } from 'common/helpers/generateSlug';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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
    unique: true,
  })
  name: string;

  @Column({ type: 'text' })
  image_bytes: string;

  @Column({
    type: 'varchar',
    length: 250,
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
  @BeforeInsert()
  @BeforeUpdate()
  generateSlugFromName() {
    return (this.slug = generateSlug(this.name));
  }
  @ManyToOne(() => CategoryEntity, (category) => category.stores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'category_id',
  })
  category: CategoryEntity;

  @Column({
    type: 'int',
    nullable: true,
  })
  category_id: number;

  @OneToMany(() => CouponEntity, (coupon) => coupon.store, {
    cascade: true, // optional: saves coupons when you save a store
    eager: false, // keep false unless you always need them
  })
  coupons: CouponEntity[];
}
