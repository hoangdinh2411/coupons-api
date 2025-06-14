import { ROLES } from 'common/constants/enum/roles.enum';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
    type: 'int',
    nullable: true,
  })
  verify_code: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;
}
