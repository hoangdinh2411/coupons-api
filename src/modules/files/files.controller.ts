import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './pipes/fileValidation.pipe';
import { FilesService } from './files.service';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UserEntity } from 'modules/users/entities/users.entity';
import { FilesDto } from './dto/files.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @UseInterceptors(FilesInterceptor('files', 10))
  @Post()
  @HttpCode(200)
  async upload(
    @UploadedFiles(FileValidationPipe) files: Express.Multer.File[],
    @CurrentUser() user: UserEntity,
  ) {
    const saved_files = [];
    for (let index = 0; index < files.length; index++) {
      const result = await this.fileService.upload(files[index], user.user_id);
      saved_files.push(result);
    }
    return await this.fileService.saveFile(saved_files);
  }
  @Delete()
  @HttpCode(200)
  async delete(@Body() body: FilesDto) {
    return await this.fileService.delete(body.public_id);
  }
}
