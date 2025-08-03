import { TimestampEntity } from 'common/constants/base.entity';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { UserEntity } from 'modules/users/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class CommentEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

  @ManyToOne(() => BlogsEntity, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog_id',
  })
  blog: BlogsEntity;
}
