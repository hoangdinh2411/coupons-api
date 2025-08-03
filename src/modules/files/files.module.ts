import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';

const MAX_SIZE_MB = 3;
@Module({
  imports: [
    CloudinaryModule,
    ConfigModule,
    MulterModule.register({
      dest: './uploads',
      limits: {
        fieldSize: 1024 * 1024 * MAX_SIZE_MB,
        files: 10,
      },
    }),
    CloudinaryModule,
  ],
  providers: [FilesService],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
