import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsConfigService {
  constructor() {}
  getOptions(configServer: ConfigService): CorsOptions {
    const CORS_OPTIONS: CorsOptions = {
      origin: [configServer.get<string>('CLIENT_DOMAIN')],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'Content-Type',
        'Accept',
        'Set-Cookie',
        'Cookie',
        'Authorization',
      ],
    };
    return CORS_OPTIONS;
  }
}
