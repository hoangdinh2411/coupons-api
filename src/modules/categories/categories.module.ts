import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { FilesModule } from 'modules/files/files.module';
import { StoresModule } from 'modules/stores/stores.module';
import { FaqsModule } from 'modules/faqs/faqs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    FilesModule,
    forwardRef(() => StoresModule),
    FaqsModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
