export abstract class FileAdapter {
  public abstract upload(
    _file: Express.Multer.File,
    _folder: string,
  ): Promise<{
    public_id: string;
    url: string;
    file_name: string;
  }>;
  public abstract getUnusedImages();
  public abstract deleteOne(key: string): Promise<boolean>;
  public abstract markImageAsUsed(keys: string[]): Promise<boolean>;
  public abstract removeUnusedTagging(keys: string): Promise<boolean>;
}
