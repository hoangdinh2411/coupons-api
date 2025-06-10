import { ConflictException, Inject, Logger } from '@nestjs/common';
import { FileAdapter } from './files.adapter';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { FilesEntity } from './entities/files.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { Cron, CronExpression } from '@nestjs/schedule';
import { unlinkSync } from 'fs';

export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    @InjectRepository(FilesEntity)
    private readonly uploadedFileRepository: Repository<FilesEntity>,
    @Inject(CloudinaryService)
    private fileAdapter: FileAdapter,
  ) {}

  async upload(file: Express.Multer.File, userId: number) {
    await this.fileAdapter.upload(file, userId);
    try {
      unlinkSync(file.path);
    } catch (error) {
      throw new ConflictException(
        'Error deleting file after uploading to cloudinary',
      );
    }
  }

  async delete(public_id: string) {
    return await this.fileAdapter.deleteOne(public_id);
  }

  async saveFile(saved_files: UploadApiResponse[]) {
    // save file to unused files table and will remove after 1 hour if not used or if used to other table
    const files = saved_files.map((file) => ({
      url: file.url,
      public_id: file.public_id,
      secure_url: file.secure_url,
      uploaded_at: file.created_at,
    }));

    return await this.uploadedFileRepository.save(files);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteUnusedFilePerHour() {
    const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
    const files = await this.uploadedFileRepository
      .createQueryBuilder()
      .where('uploaded_at <= :oneHourAgo', { oneHourAgo })
      .getMany();

    if (!files || files.length === 0 || files === undefined) {
      this.logger.log('No unused file to delete');
      return;
    }
    await this.deleteUploadedFilesOnDb(files);
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      await this.fileAdapter.deleteOne(file.public_id);
    }
    this.logger.log(files.length + ' unused file has been deleted');
  }

  async deleteUploadedFilesOnDb(files: FilesEntity[], manager?: EntityManager) {
    if (files.length === 0) {
      return;
    }
    const entityManager = manager || this.uploadedFileRepository.manager;
    await entityManager.delete(
      FilesEntity,
      files.map((file) => file.file_id),
    );
  }

  async getFiles(files: FilesEntity[]) {
    return await this.uploadedFileRepository
      .createQueryBuilder()
      .where('file_id in (:...list)', {
        list: files.map((file) => file.file_id),
      })
      .getMany();
  }

  // make Image Type to be used in other modules
  async deleteImages(images: any[]) {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await this.fileAdapter.deleteOne(images[i].public_id);
      }
    }
  }
}
