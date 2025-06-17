import { generateSlug } from 'common/helpers/generateSlug';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store')
export class StoreEntity {
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
    default: 0,
  })
  rating: number;

  @Column({
    type: 'numeric',
    default: 0,
    precision: 5,
    scale: 2,
  })
  max_discount_pct: number;

  @Column({
    type: 'varchar',
    array: true,
    length: 100,
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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;
}
