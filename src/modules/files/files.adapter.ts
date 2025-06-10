export abstract class FileAdapter {
  public async upload(
    _file: Express.Multer.File,
    _userId: number,
  ): Promise<any> {}
  public async deleteOne(_file_id: string): Promise<any> {}
}
