import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './entities/files.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CloudinaryModule,
    TypeOrmModule.forFeature([FilesEntity]),
    ConfigModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ScheduleModule.forRoot(),
    CloudinaryModule,
  ],
  providers: [FilesService],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
