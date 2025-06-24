import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from 'modules/categories/categories.module';
import { BlogsEntity } from './entities/blogs.entity';
import { BlogsController } from './blogs.controller';
import { BlogService } from './blogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogsEntity]), CategoriesModule],
  controllers: [BlogsController],
  providers: [BlogService],
})
export class BlogsModule {}
