import { INestApplication, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

@Injectable()
export class SwaggerApiDocService {
  constructor(private configService: ConfigService) {}

  getOptions(): Omit<OpenAPIObject, 'paths'> {
    return (
      new DocumentBuilder()
        .addCookieAuth('token', {
          in: 'cookie',
          type: 'apiKey',
          name: 'token',
          description: 'Enter your token here',
        })
        .setTitle('Localite guide app API')
        .setDescription('API Documentation for the travel social media app')
        .setVersion('1.0')
        .addServer(this.configService.get('API_URL'), 'Development server')
        // .addServer(
        //   this.configService.get<string>('STAGING_DOMAIN'),
        //   'Staging server',
        // )
        // .addServer(
        //   this.configService.get<string>('PRODUCTION_DOMAIN'),
        //   'Production server',
        // )
        .build()
    );
  }

  setUp(app: INestApplication) {
    const options = this.getOptions();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api/v1/docs', app, document, {
      swaggerOptions: {
        withCredentials: true,
      },
    });
  }
}
