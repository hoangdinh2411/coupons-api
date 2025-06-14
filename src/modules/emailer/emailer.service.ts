import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'modules/users/entities/users.entity';

@Injectable()
export class EmailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyCode(new_user: UserEntity) {
    try {
      await this.mailerService.sendMail({
        to: new_user.email,
        template: 'verifyCode',
        subject: 'Verify email',
        context: {
          code: new_user.verify_code,
          username: new_user.email,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
