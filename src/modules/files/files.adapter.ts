import { UploadApiResponse } from 'cloudinary';

export abstract class FileAdapter {
  public abstract upload(
    _file: Express.Multer.File,
    _folder: string,
  ): Promise<UploadApiResponse>;
  public abstract deleteOne(_public_id: string): Promise<string>;
  public abstract markImageAsUsed(_public_ids: string[]): Promise<boolean>;
}
