import { FileAdapter } from '../files.adapter';
import { UploadApiResponse, v2 } from 'cloudinary';
import { ConflictException } from '@nestjs/common';
export class CloudinaryService implements FileAdapter {
  async upload(
    file: Express.Multer.File,
    userId: number,
  ): Promise<UploadApiResponse> {
    const result = await v2.uploader.upload(file.path, {
      folder: `user/${userId}`,
      resource_type: file.mimetype.split(
        '/',
      )[0] as UploadApiResponse['resource_type'],
    });
    if (!result) {
      throw new ConflictException('Error uploading file to cloudinary');
    }
    return result;
  }

  async deleteOne(file_id: string): Promise<void> {
    await v2.uploader.destroy(file_id);
  }
}
