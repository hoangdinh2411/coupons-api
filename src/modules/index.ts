import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JWTAuthStrategy } from './auth/strategy/jwt.strategy';
import { HealthModule } from './health/health.module';
import { UserModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { StoresModule } from './stores/stores.module';
import { EmailModule } from './emailer/emailer.module';
import { CouponsModule } from './coupons/coupons.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    HealthModule,
    CategoriesModule,
    StoresModule,
    EmailModule,
    CouponsModule,
    PostsModule,
  ],
  providers: [JWTAuthStrategy],
})
export class Modules {}
