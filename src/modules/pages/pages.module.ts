import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from './entities/page.entity';
import { FaqsModule } from 'modules/faqs/faqs.module';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity]), FaqsModule],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
