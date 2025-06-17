import { generateSlug } from 'common/helpers/generateSlug';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { PostEntity } from 'modules/posts/entities/post.entity';
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
export class CategoryEntity {
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

  @OneToMany(() => PostEntity, (posts) => posts.category)
  posts: PostEntity[];

  @OneToMany(() => CouponEntity, (store) => store.category)
  coupons: CouponEntity[];
}
