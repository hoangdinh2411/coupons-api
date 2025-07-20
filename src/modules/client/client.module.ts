import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TopicModule } from 'modules/topic/topic.module';
import { BlogsModule } from 'modules/blogs/blogs.module';
import { StoresModule } from 'modules/stores/stores.module';
import { CategoriesModule } from 'modules/categories/categories.module';
import { CommentsModule } from 'modules/comments/comments.module';

@Module({
  imports: [
    TopicModule,
    BlogsModule,
    StoresModule,
    CategoriesModule,
    CommentsModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
