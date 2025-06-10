import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class FilesEntity {
  @PrimaryGeneratedColumn('uuid')
  file_id: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  url: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  secure_url: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  public_id: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploaded_at: Date;
}
