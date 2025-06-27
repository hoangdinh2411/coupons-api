import { ConflictException, Inject } from '@nestjs/common';
import { FileAdapter } from './files.adapter';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { unlinkSync } from 'fs';

export class FilesService {
  constructor(
    @Inject(CloudinaryService)
    private fileAdapter: FileAdapter,
  ) {}

  async upload(file: Express.Multer.File, folder: string) {
    const result = await this.fileAdapter.upload(file, folder);
    unlinkSync(file.path);
    return result;
  }

  async delete(public_id: string) {
    return await this.fileAdapter.deleteOne(public_id);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteUnusedFilePerHour() {
    // const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
    // if (!files || files.length === 0 || files === undefined) {
    //   this.logger.log('No unused file to delete');
    //   return;
    // }
    // await this.deleteUploadedFilesOnDb(files);
    // for (let index = 0; index < files.length; index++) {
    //   const file = files[index];
    //   await this.fileAdapter.deleteOne(file.public_id);
    // }
    // this.logger.log(files.length + ' unused file has been deleted');
  }

  // make Image Type to be used in other modules
  async deleteImages(images: any[]) {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await this.fileAdapter.deleteOne(images[i].public_id);
      }
    }
  }
  async markImageAsUsed(public_ids: string[]) {
    if (!public_ids) {
      throw new ConflictException('Do not have any publics id to remove tag');
    }
    return await this.fileAdapter.markImageAsUsed(public_ids);
  }
}
