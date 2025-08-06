import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

export const AwsS3Provider: Provider = {
  provide: 'aws-s3',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AWS.S3 => {
    return new AWS.S3({
      region: configService.get<string>('AWS_REGION'),
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  },
};
