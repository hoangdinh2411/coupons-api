import dayjs from 'dayjs';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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

  @Column({
    type: 'boolean',
    default: false,
  })
  is_exclusive: boolean;

  @Column({
    type: 'date',
  })
  expire_date: string;

  @BeforeInsert()
  @BeforeUpdate()
  validateDate() {
    if (!dayjs(this.expire_date).isAfter(dayjs(), 'day')) {
      throw new Error('End date must be after today');
    }
  }
  @ManyToOne(() => StoreEntity, (store) => store.coupons, {
    onDelete: 'CASCADE',
  })
  store: StoreEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;
}
