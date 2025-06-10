import { ConfigModule, ConfigService } from '@nestjs/config';
import { Modules } from './modules';
import {
  InternalServerErrorException,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { LoggerMiddleware } from 'common/middlewares/requestLogger.middleware';
import { CorsConfigService } from 'config/cors.config';
import { SwaggerApiDocService } from 'config/apiDocs.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'common/guards/jwtAuth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from 'common/guards/role.guard';
import { DataSource } from 'typeorm';
import { DatabaseConfig } from 'config/dto/config.dto';
import { validateSync } from 'class-validator';
import { getDbConfig } from 'config/db.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const configObject = new DatabaseConfig();
        Object.assign(configObject, config);
        const errors = validateSync(configObject);
        if (errors.length > 0) {
          throw new InternalServerErrorException(
            'DB Configuration validation failed on property: ' +
              errors[0].property,
          );
        }
        return config;
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDbConfig(configService),
      inject: [ConfigService],
    }),
    Modules,
  ],
  providers: [
    CorsConfigService,
    SwaggerApiDocService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {
  constructor(private readonly _dataSource: DataSource) {}
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
