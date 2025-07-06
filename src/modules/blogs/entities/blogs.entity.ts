import { BaseEntity } from 'common/constants/base.entity';
import { TopicEntity } from 'modules/topic/entities/topic.entity';
import { UserEntity } from 'modules/users/entities/users.entity';
import {
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
    type: 'text',
  })
  content: string;

  @Column({ type: 'text', nullable: false, unique: true })
  slug: string;

  @Column({ type: 'jsonb', nullable: true })
  image: {
    url: string;
    public_id: string;
    file_name: string;
  };

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  keywords: string[];

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

  @ManyToOne(() => TopicEntity, (topic) => topic.blogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'topic_id',
  })
  topic: TopicEntity;

  @Column({
    type: 'int',
    nullable: true,
  })
  topic_id: number;

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
