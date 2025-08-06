import { ConflictException, Inject } from '@nestjs/common';
import { FileAdapter } from './files.adapter';
import { extractPublicIdsFromHtml } from 'common/helpers/image';
import { AwsS3Service } from './aws-s3/aws-s3.service';

export class FilesService {
  constructor(
    @Inject(AwsS3Service)
    private fileAdapter: FileAdapter,
  ) {}

  async upload(
    file: Express.Multer.File,
    folder: string,
    is_used: boolean = true,
  ) {
    try {
      const result = await this.fileAdapter.upload(file, folder, is_used);
      return result;
    } catch (error) {
      throw error; // 👈 propagate lỗi lên để transaction biết
    }
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

  async deleteUnusedFilePerDay() {
    const public_ids = await this.fileAdapter.getUnusedImages();
    if (public_ids) {
      await Promise.all(public_ids.map((k) => this.delete(k)));
    }
  }

  // make Image Type to be used in other modules
  async deleteImages(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => this.delete(id)));
    } catch (error) {
      throw error; // 👈 propagate lỗi lên để transaction biết
    }
  }
  async markImageAsUsed(public_ids: string[]) {
    try {
      if (!public_ids) {
        throw new ConflictException('Do not have any publics id to remove tag');
      }
      return await this.fileAdapter.markImageAsUsed(public_ids);
    } catch (error) {
      throw error; // 👈 propagate lỗi lên để transaction biết
    }
  }

  async updateTagsFOrUsedImagesFromHtml(html: string) {
    try {
      const public_ids = extractPublicIdsFromHtml(html);
      if (public_ids) {
        await this.markImageAsUsed(public_ids);
      }
    } catch (error) {
      throw error; // 👈 propagate lỗi lên để transaction biết
    }
  }
}
