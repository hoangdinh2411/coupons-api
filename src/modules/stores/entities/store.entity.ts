import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
    type: 'varchar',
    length: 250,
  })
  image_url: string;
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
}
