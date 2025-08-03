import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDbConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const baseOptions: TypeOrmModuleOptions = {
    type: 'postgres' as const,
    retryDelay: 3000,
    retryAttempts: 10,
    autoLoadEntities: true,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    logging: ['query', 'error', 'warn'],
    synchronize: !isProduction,
    name: 'analytics',
  };
  let environmentOptions: Partial<TypeOrmModuleOptions> = {};
  const isProd = configService.get('NODE_ENV') === 'production';
  if (!isProd) {
    environmentOptions = {
      url: configService.get<string>('POSTGRES_URL'),
    };
  } else {
    environmentOptions = {
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
    };
  }
  return {
    ...baseOptions,
    ...environmentOptions,
  } as TypeOrmModuleOptions;
}
