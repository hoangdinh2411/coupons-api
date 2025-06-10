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
        .addServer(
          `http://localhost:${this.configService.get('API_PORT')}`,
          'Development server',
        )
        // .addServer(
        //   this.configService.get<string>('STAGING_DOMAIN'),
        //   'Staging server',
        // )
        // .addServer(
        //   this.configService.get<string>('PRODUCTION_DOMAIN'),
        //   'Production server',
        // )
        .addTag('Auth', 'Authentication related endpoints')
        .addTag('Comments', 'Comments related endpoints')
        .addTag('Feeds', 'Feeds related endpoints')
        .addTag('Files', 'Handle file endpoints')
        .addTag('Follow/Un-follow', 'Follow and un-follow users endpoints')
        .addTag('Health', 'Health check endpoints')
        .addTag('Reactions', 'Reaction for feeds and comments endpoints')
        .addTag('Users', 'User related endpoints')
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
