import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/httpException.filter';
import { SwaggerApiDocService } from 'config/apiDocs.config';
import { CorsConfigService } from 'config/cors.config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ResponseFormatInterceptor } from 'common/interceptors/responseFormat.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  const swaggerApiDoc = app.get(SwaggerApiDocService);
  swaggerApiDoc.setUp(app);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
    }),
  );
  const configServer = new ConfigService();
  const corsConfigService = app.get(CorsConfigService);
  app.enableCors(corsConfigService.getOptions(configServer));
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  await app.listen(configServer.get<string>('API_PORT'));
}
bootstrap();
