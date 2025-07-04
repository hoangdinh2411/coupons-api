import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipes/fileValidation.pipe';
import { FilesService } from './files.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enums';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  @Roles(ROLES.ADMIN)
  @HttpCode(200)
  async upload(
    @UploadedFiles(FileValidationPipe) files: Express.Multer.File[],
    @Body('folder') folder: string,
  ) {
    const saved_files = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const result = await this.fileService.upload(file, folder);
      const data = {
        public_id: result.public_id,
        url: result.secure_url,
        file_name: `${result.original_filename}.${result.original_extension}`,
      };
      saved_files.push(data);
    }
    return saved_files;
  }
  @Patch()
  @Roles(ROLES.ADMIN)
  @HttpCode(200)
  async delete(@Body() data: string[]) {
    return await this.fileService.deleteImages(data);
  }
}
