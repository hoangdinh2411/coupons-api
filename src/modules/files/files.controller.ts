import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Logger,
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
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly fileService: FilesService) {}

  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  @Roles(ROLES.ADMIN, ROLES.PARTNER, ROLES.USER)
  @HttpCode(200)
  async upload(
    @UploadedFiles(FileValidationPipe) files: Express.Multer.File[],
    @Body() data: { folder: string },
  ) {
    try {
      const saved_files = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const result = await this.fileService.upload(file, data.folder);
        saved_files.push(result);
      }
      return saved_files;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  @Patch()
  @Roles(ROLES.ADMIN, ROLES.PARTNER)
  @HttpCode(200)
  async delete(@Body() ids: string[]) {
    return await this.fileService.deleteImages(ids);
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  @Delete()
  @HttpCode(200)
  async removeUnusedImages() {
    this.logger.log('removeUnusedImages');
    return await this.fileService.deleteUnusedFilePerDay();
  }
}
