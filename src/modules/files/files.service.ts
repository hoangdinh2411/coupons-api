import { ConflictException, Inject, Logger } from '@nestjs/common';
import { FileAdapter } from './files.adapter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { extractPublicIdsFromHtml } from 'common/helpers/image';
import { AwsS3Service } from './aws-s3/aws-s3.service';

export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @Inject(AwsS3Service)
    private fileAdapter: FileAdapter,
  ) {}

  async upload(file: Express.Multer.File, folder: string) {
    try {
      const result = await this.fileAdapter.upload(file, folder);
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
  async deleteImageFromHTML(html: string) {
    try {
      const public_ids = extractPublicIdsFromHtml(html);
      if (public_ids) {
        await this.deleteImages(public_ids);
      }
    } catch (_error) {
      throw new ConflictException('cannot delete image for this content');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async deleteUnusedFilePerDay() {
    const public_ids = await this.fileAdapter.getUnusedImages();
    const results = [];
    for (const key of public_ids) {
      try {
        await this.delete(key); // hàm đã ném lỗi nếu key không hợp lệ
        results.push({ key, status: 'deleted' });
      } catch (err) {
        // log và bỏ qua
        this.logger.warn(`Cannot delete key: ${key} - ${err.message}`);
        results.push({ key, status: 'failed', error: err.message });
        continue; // tiếp tục vòng lặp
      }
    }

    return results;
  }

  // make Image Type to be used in other modules
  async deleteImages(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => this.delete(id)));
    } catch (error) {
      throw error;
    }
  }
  async markImageAsUsed(public_ids: string[]) {
    try {
      if (!public_ids) {
        throw new ConflictException('Do not have any publics id to remove tag');
      }
      return await this.fileAdapter.markImageAsUsed(public_ids);
    } catch (error) {
      throw error;
    }
  }

  async updateTagsFOrUsedImagesFromHtml(html: string) {
    try {
      const public_ids = extractPublicIdsFromHtml(html);
      if (public_ids) {
        await this.markImageAsUsed(public_ids);
      }
    } catch (error) {
      throw error;
    }
  }
}
