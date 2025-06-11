import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
    length: 1000,
  })
  code: string;

  @Column({
    type: 'text',
  })
  offer_detail: string;

  
}
