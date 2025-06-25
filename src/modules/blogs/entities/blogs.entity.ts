import { BaseEntity } from 'common/constants/base.entity';
import { generateSlug } from 'common/helpers/generateSlug';
import { RawDraftContentState } from 'common/helpers/IsNotEmptyDraftContent';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { UserEntity } from 'modules/users/entities/users.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('blog')
export class BlogsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'json',
  })
  content: RawDraftContentState;

  @Column({ type: 'text' })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlugFromName() {
    return (this.slug = generateSlug(this.title));
  }
  // image bytes = base 64
  @Column({ type: 'text' })
  image_bytes: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  tags: string[];

  @ManyToOne(() => UserEntity, (user) => user.blogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'created_by',
  })
  user: UserEntity;
  @Column({
    type: 'int',
    default: 1,
  })
  rating: number;
  @Column({
    type: 'int',
    nullable: true,
  })
  created_by: number;

  @ManyToOne(() => CategoryEntity, (category) => category.posts, {
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
  is_published: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_indexed: boolean;
}
