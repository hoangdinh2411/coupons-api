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
    entities: [__dirname + '**/*.entity.{js,ts}'],
    logging: ['query', 'error', 'warn'],
    synchronize: !isProduction,
  };
  let environmentOptions: Partial<TypeOrmModuleOptions> = {};
  const isProd = configService.get('NODE_ENV') === 'production';
  if (isProd) {
    environmentOptions = {
      url: configService.get<string>('POSTGRES_URL'),
    };
  } else {
    environmentOptions = {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'coupons',
    };
  }
  // // connect database local
  // environmentOptions = {
  //   host: configService.get<string>('POSTGRES_HOST'),
  //   port: parseInt(configService.get<string>('POSTGRES_PORT'), 10),
  //   username: configService.get<string>('POSTGRES_USERNAME'),
  //   password: configService.get<string>('POSTGRES_PASSWORD'),
  //   database: configService.get<string>('POSTGRES_DATABASE'),
  // };

  return {
    ...baseOptions,
    ...environmentOptions,
  } as TypeOrmModuleOptions;
}
