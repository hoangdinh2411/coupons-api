import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CategoriesModule } from 'modules/categories/categories.module';
import { FilesModule } from 'modules/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, CategoryEntity]),
    forwardRef(() => CategoriesModule),
    FilesModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
