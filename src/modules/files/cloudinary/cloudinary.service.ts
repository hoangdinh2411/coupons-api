import { FileAdapter } from '../files.adapter';
import { UploadApiResponse, v2, UploadApiErrorResponse } from 'cloudinary';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
export class CloudinaryService implements FileAdapter {
  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    try {
      return await v2.uploader.upload(file.path, {
        folder,
        filename_override: file.originalname,
        tags: ['temp_image'],
        resource_type: file.mimetype.split(
          '/',
        )[0] as UploadApiResponse['resource_type'],
      });
    } catch (error) {
      if (error instanceof Error && 'http_code' in error) {
        const cloudError = error as UploadApiErrorResponse;
        throw new ConflictException(cloudError.message);
      }
      throw new InternalServerErrorException("'Unexpected upload error'");
    }
  }

  async deleteOne(public_id: string): Promise<boolean> {
    try {
      await v2.uploader.destroy(public_id);
      return true;
    } catch (error) {
      const cloudErr = error as UploadApiErrorResponse;

      if ('http_code' in cloudErr && cloudErr.http_code === 404) {
        throw new ConflictException(`Image with ID ${public_id} not found`);
      }
      throw new ConflictException('Could not delete image ' + public_id);
    }
  }

  async markImageAsUsed(public_ids: string[]): Promise<boolean> {
    try {
      await v2.uploader.remove_all_tags(public_ids);
      return true;
    } catch (error) {
      const cloudErr = error as UploadApiErrorResponse;

      if ('http_code' in cloudErr && cloudErr.http_code === 404) {
        throw new ConflictException(`Images with ID ${public_ids} not found`);
      }
      throw new ConflictException(
        'Could not remove tag on images ' + public_ids,
      );
    }
  }
}
