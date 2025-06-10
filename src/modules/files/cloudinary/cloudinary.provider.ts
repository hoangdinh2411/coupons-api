import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2, ConfigOptions } from 'cloudinary';

export const CloudinaryProvider: Provider = {
  provide: 'Cloudinary',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ConfigOptions => {
    return v2.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  },
};
