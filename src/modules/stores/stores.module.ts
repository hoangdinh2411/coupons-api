import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { CategoriesModule } from 'modules/categories/categories.module';
import { FilesModule } from 'modules/files/files.module';
import { FaqsModule } from 'modules/faqs/faqs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity]),
    forwardRef(() => CategoriesModule),
    FilesModule,
    FaqsModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
