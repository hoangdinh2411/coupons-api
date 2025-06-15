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

  const environmentOptions: Partial<TypeOrmModuleOptions> = {
    url: configService.get<string>('POSTGRES_URL'),
  };
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
