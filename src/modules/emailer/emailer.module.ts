import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { cwd } from 'process';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          // tls: {
          //   ciphers: 'SSLv3',
          // },
          secure: true, // true for 465, false for other ports
          auth: {
            user: configService.get<string>('EMAIL_ID'), // generated ethereal user
            pass: configService.get<string>('EMAIL_PASS'), // generated ethereal password
          },
          from: configService.get<string>('EMAIL_FROM'),
        },
        template: {
          dir: join(cwd(), 'src', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class EmailModule {}
