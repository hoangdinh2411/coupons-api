import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { memoryStorage } from 'multer';

const MAX_SIZE_MB = 3;
@Module({
  imports: [
    AwsS3Module,
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fieldSize: 1024 * 1024 * MAX_SIZE_MB,
        files: 10,
      },
    }),
  ],
  providers: [FilesService],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
