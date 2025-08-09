import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from './emailer.service';
import { existsSync } from 'fs';

const prodDir = join(__dirname, 'templates'); // <project>/dist/templates
const devDir = join(process.cwd(), 'src', 'templates'); // <project>/src/templates
const templatesDir = existsSync(prodDir) ? prodDir : devDir;

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('EMAIL_HOST'),
            port: Number(configService.get<string>('EMAIL_PORT')),
            // tls: {
            //   ciphers: 'SSLv3',
            // },
            secure: Number(configService.get<string>('EMAIL_PORT')) === 465, // true for 465, false for other ports
            auth: {
              user: configService.get<string>('EMAIL_ID'), // generated ethereal user
              pass: configService.get<string>('EMAIL_PASS'), // generated ethereal password
            },
            from: configService.get<string>('EMAIL_FROM'),
            replyTo: configService.get<string>('EMAIL_REPLY_TO'),
          },
          defaults: {
            from: `Trust Coupon ${configService.get<string>('EMAIL_FROM')}`,
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailerService],
  exports: [EmailerService],
})
export class EmailModule {}
