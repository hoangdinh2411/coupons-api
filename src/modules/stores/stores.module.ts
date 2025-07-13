import { forwardRef, Module } from '@nestjs/common';
import { StoresService } from './services/stores.service';
import { StoresController } from './stores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from './entities/store.entity';
import { CategoriesModule } from 'modules/categories/categories.module';
import { FilesModule } from 'modules/files/files.module';
import { FAQEntity } from './entities/faq.entity';
import { FAQService } from './services/faqs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, FAQEntity]),
    forwardRef(() => CategoriesModule),
    FilesModule,
  ],
  controllers: [StoresController],
  providers: [StoresService, FAQService],
  exports: [StoresService],
})
export class StoresModule {}
