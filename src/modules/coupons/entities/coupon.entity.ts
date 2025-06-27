import { BaseEntity } from 'common/constants/base.entity';
import { CouponType } from 'common/constants/enum/coupon.enum';
import dayjs from 'dayjs';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import { UserEntity } from 'modules/users/entities/users.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('coupon')
export class CouponEntity extends BaseEntity {
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
    type: 'text',
    nullable: true,
  })
  offer_link: string;

  @Column({
    type: 'int',
    default: 1,
  })
  rating: number;

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

  @ManyToMany(() => CategoryEntity, (category) => category.coupons, {
    cascade: true,
  })
  @JoinTable({
    name: 'coupons-categories',
    joinColumn: {
      name: 'coupon_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];

  @Column({
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;
}
