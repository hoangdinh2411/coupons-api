import {
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File is required');
    }

    files.forEach((f) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedMimeTypes.includes(f.mimetype)) {
        throw new UnprocessableEntityException(
          'Invalid file type. Only JPEG and PNG files are allowed',
        );
      }
      // const maximumFileSize = 1024 * 1024 * 2;
      // if (f.size > maximumFileSize) {
      //   throw new UnprocessableEntityException('File size is too large');
      // }
    });

    return files;
  }
}
