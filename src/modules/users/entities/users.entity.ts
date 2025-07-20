import { Exclude } from 'class-transformer';
import { BaseEntity } from 'common/constants/base.entity';
import { ROLES } from 'common/constants/enums';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { CommentEntity } from 'modules/comments/entities/comment.entity';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  first_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  last_name: string;

  @Column({
    enum: ROLES,
    default: ROLES.USER,
  })
  role: ROLES;

  @Column({
    type: 'boolean',
    default: false,
  })
  email_verified: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  @Exclude()
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @Exclude()
  verify_code: string;

  @OneToMany(() => CouponEntity, (coupons) => coupons.user)
  coupons: CouponEntity[];

  @ManyToMany(() => CouponEntity, (coupons) => coupons.saved_by_user)
  @JoinTable({
    name: 'users-coupons',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'coupon_id',
      referencedColumnName: 'id',
    },
  })
  saved_coupons: CouponEntity[];

  @OneToMany(() => BlogsEntity, (posts) => posts.user)
  blogs: BlogsEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];
}
