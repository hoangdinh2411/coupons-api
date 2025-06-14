import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';


const allowOrigins = ['http://localhost:3000']
@Injectable()
export class CorsConfigService {
  constructor() {}
  getOptions(configServer: ConfigService): CorsOptions {
    const CORS_OPTIONS: CorsOptions = {
      origin: (origin, callback)=>{
        if(!origin || [...allowOrigins, configServer.get<string>('CLIENT_HOST'),configServer.get<string>('ADMIN_HOST')].includes(origin))
        {
          callback(null, true)
        }else{
          callback(new Error(`Origin ${origin} not allowed by CORS`))
        }
        },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'Content-Type',
        'Accept',
        'Set-Cookie',
        'Cookie',
      ],
    };
    return CORS_OPTIONS;
  }
}
