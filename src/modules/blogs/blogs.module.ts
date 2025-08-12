import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsEntity } from './entities/blogs.entity';
import { BlogsController } from './blogs.controller';
import { BlogService } from './blogs.service';
import { TopicModule } from 'modules/topic/topic.module';
import { TopicEntity } from 'modules/topic/entities/topic.entity';
import { FilesModule } from 'modules/files/files.module';
import { FaqsModule } from 'modules/faqs/faqs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogsEntity, TopicEntity]),
    TopicModule,
    FilesModule,
    FaqsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogsModule {}
