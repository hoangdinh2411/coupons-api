import { BaseEntity } from 'common/constants/base.entity';
import { generateSlug } from 'common/helpers/generateSlug';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
export class CategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlugFromName() {
    return (this.slug = generateSlug(this.name));
  }

  @Column({ type: 'text' })
  image_bytes: string;

  @OneToMany(() => StoreEntity, (store) => store.category)
  stores: StoreEntity[];

  @OneToMany(() => BlogsEntity, (posts) => posts.category)
  posts: BlogsEntity[];

  @OneToMany(() => CouponEntity, (store) => store.category)
  coupons: CouponEntity[];
}
