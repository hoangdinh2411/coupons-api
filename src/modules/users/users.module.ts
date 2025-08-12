import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UserService } from './services/users.service';
import { CouponsModule } from 'modules/coupons/coupons.module';
import { BcryptService } from './services/bcrypt.service';
import { FilesModule } from 'modules/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), CouponsModule, FilesModule],
  controllers: [UserController],
  providers: [UserService, BcryptService],
  exports: [UserService, BcryptService],
})
export class UserModule {}
