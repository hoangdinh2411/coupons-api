import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWTAuthStrategy } from './strategy/jwt.strategy';
import { UserEntity } from 'modules/users/entities/users.entity';
import { UserModule } from 'modules/users/users.module';
import { EmailModule } from 'modules/emailer/emailer.module';
import { RegularUserStrategy } from './strategy/regular-user.strategy';
import { SuperAdminStrategy } from './strategy/super-admin.strategy';
import { SignUpStrategyFactory } from './factory/signup-strategy.factory';
import { TokenService } from './services/token.service';
import { VerifyCodeFactory } from './factory/verify-code-strategy.factory';
import { CodeForChangePasswordStrategy } from './strategy/code-for-change-password.strategy';
import { CodeForVerifyEmailStrategy } from './strategy/code-for-verify-email.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JWTAuthStrategy,
    RegularUserStrategy,
    SuperAdminStrategy,
    SignUpStrategyFactory,
    VerifyCodeFactory,
    CodeForChangePasswordStrategy,
    CodeForVerifyEmailStrategy,
    TokenService,
  ],
})
export class AuthModule {}
