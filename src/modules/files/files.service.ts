import { ConflictException, Inject } from '@nestjs/common';
import { FileAdapter } from './files.adapter';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { unlinkSync } from 'fs';
import { extractPublicIdsFromHtml } from 'common/helpers/image';

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
    try {
      return await this.fileAdapter.deleteOne(public_id);
    } catch (_error) {
      throw new ConflictException(
        'cannot delete image with public id ' + public_id,
      );
    }
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
  async deleteImages(ids: string[]) {
    for (const id of ids) {
      await this.delete(id);
    }
  }
  async markImageAsUsed(public_ids: string[]) {
    if (!public_ids) {
      throw new ConflictException('Do not have any publics id to remove tag');
    }
    return await this.fileAdapter.markImageAsUsed(public_ids);
  }

  async updateTagsFOrUsedImagesFromHtml(html: string) {
    const public_ids = extractPublicIdsFromHtml(html);
    if (public_ids) {
      await this.markImageAsUsed(public_ids);
    }
  }
}
