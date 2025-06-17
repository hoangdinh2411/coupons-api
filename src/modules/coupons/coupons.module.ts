import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponEntity } from './entities/coupon.entity';
import { StoresModule } from 'modules/stores/stores.module';
import { CategoriesModule } from 'modules/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CouponEntity]),
    StoresModule,
    CategoriesModule,
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
