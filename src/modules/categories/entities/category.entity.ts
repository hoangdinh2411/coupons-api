import { BaseEntity } from 'common/constants/base.entity';
import { generateSlug } from 'common/helpers/generateSlug';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { FAQEntity } from 'modules/faqs/entities/faq.entity';
import { StoreEntity } from 'modules/stores/entities/store.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
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

  @Column({ type: 'text', nullable: true })
  description: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlugFromName() {
    return (this.slug = generateSlug(this.name));
  }

  @Column({ type: 'jsonb', nullable: true })
  image: {
    url: string;
    public_id: string;
    file_name: string;
  };

  @ManyToMany(() => StoreEntity, (store) => store.categories)
  stores: StoreEntity[];

  @ManyToMany(() => CouponEntity, (coupon) => coupon.categories)
  coupons: CouponEntity[];

  @OneToMany(() => FAQEntity, (faq) => faq.category, {
    cascade: false,
    eager: false,
  })
  faqs: FAQEntity[];
}
