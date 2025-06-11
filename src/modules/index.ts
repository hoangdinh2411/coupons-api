import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JWTAuthStrategy } from './auth/strategy/jwt.strategy';
import { HealthModule } from './health/health.module';
import { FilesModule } from './files/files.module';
import { UserModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [UserModule, AuthModule, HealthModule, FilesModule , CategoriesModule,StoresModule],
  providers: [JWTAuthStrategy],
})
export class Modules {}
