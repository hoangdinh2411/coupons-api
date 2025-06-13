import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { CategoriesService } from 'modules/categories/categories.service';
import { CategoryEntity } from 'modules/categories/entities/category.entity';
import { CategoriesModule } from 'modules/categories/categories.module';

@Module({
  imports:[TypeOrmModule.forFeature([StoreEntity, CategoryEntity]), CategoriesModule ],
  controllers: [StoresController],
  providers: [StoresService],
  exports:[StoresService]
})
export class StoresModule {}
