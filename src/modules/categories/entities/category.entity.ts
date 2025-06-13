import { generateSlug } from 'common/helpers/generateSlug';
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

  @OneToMany(() => StoreEntity, (store) => store.category, {
    cascade: true, // optional: saves coupons when you save a store
    eager: false, // keep false unless you always need them
  })
  stores: StoreEntity[];
}
