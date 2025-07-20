import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsEntity } from 'modules/blogs/entities/blogs.entity';
import { CommentEntity } from './entities/comment.entity';
import { BlogsModule } from 'modules/blogs/blogs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogsEntity, CommentEntity]),
    BlogsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
