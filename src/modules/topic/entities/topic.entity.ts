import { BaseEntity } from 'common/constants/base.entity';
import { generateSlug } from 'common/helpers/generateSlug';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('topic')
export class TopicEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  slug: string;

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

  @OneToMany(() => BlogsEntity, (blog) => blog.topic, {
    cascade: true,
    eager: false,
    onDelete: 'CASCADE',
  })
  blogs: BlogsEntity[];
}
