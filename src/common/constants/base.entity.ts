import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deleted_at: Date;

  //seo
  @Column({ type: 'text', nullable: true })
  seo_title: string;

  @Column({ type: 'text', nullable: true })
  seo_description: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  seo_keywords: string[];
}
