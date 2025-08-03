import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQEntity } from './entities/faq.entity';
import { FAQService } from './services/faqs.service';

@Module({
  imports: [TypeOrmModule.forFeature([FAQEntity])],
  controllers: [],
  providers: [FAQService],
  exports: [FAQService],
})
export class FaqsModule {}
