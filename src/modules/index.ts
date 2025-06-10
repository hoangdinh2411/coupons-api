import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JWTAuthStrategy } from './auth/strategy/jwt.strategy';
import { HealthModule } from './health/health.module';
import { FilesModule } from './files/files.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [UserModule, AuthModule, HealthModule, FilesModule],
  providers: [JWTAuthStrategy],
})
export class Modules {}
