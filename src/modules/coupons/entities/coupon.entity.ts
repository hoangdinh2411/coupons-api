import { CouponType } from 'common/constants/enum/coupon.enum';
import dayjs from 'dayjs';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { UserEntity } from 'modules/users/entities/users.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coupon')
export class CouponEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  code: string;

  @Column({
    type: 'text',
  })
  offer_detail: string;

  @Column({
    type: 'int',
    default: 0,
  })
  did_work: number;

  @Column({
    type: 'int',
    default: 0,
  })
  did_not_work: number;

  @ManyToOne(() => UserEntity, (user) => user.coupons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'added_by',
  })
  user: UserEntity;

  @Column({
    type: 'int',
    nullable: true,
  })
  added_by: number;

  @Column({
    type: 'enum',
    enum: CouponType,
    default: CouponType.CODE,
  })
  type: CouponType;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_exclusive: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  start_date: string;
  @Column({
    type: 'date',
    nullable: true,
  })
  expire_date: string;

  @BeforeInsert()
  @BeforeUpdate()
  validateDate() {
    if (!dayjs(this.expire_date).isAfter(this.start_date, 'day')) {
      throw new Error('End date must be after start date');
    }
  }
  @ManyToOne(() => StoreEntity, (store) => store.coupons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'store_id',
  })
  store: StoreEntity;

  @Column({
    type: 'int',
    nullable: true,
  })
  store_id: number;

  @ManyToOne(() => CategoryEntity, (category) => category.coupons, {
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

  @Column({
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;
}
