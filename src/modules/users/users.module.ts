import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UserService } from './users.service';
import { CouponsModule } from 'modules/coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), CouponsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
