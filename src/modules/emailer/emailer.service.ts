import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'modules/users/entities/users.entity';

@Injectable()
export class EmailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyCode(new_user: UserEntity, verify_code) {
    try {
      await this.mailerService.sendMail({
        to: new_user.email,
        template: 'verifyCode',
        subject: 'Verify email',
        context: {
          code: verify_code,
          name:
            new_user.first_name + ' ' + new_user.last_name || new_user.email,
        },
      });
    } catch (error) {
      throw error;
    }
  }
  async sendCodeForChangePassword(new_user: UserEntity, code: number) {
    try {
      await this.mailerService.sendMail({
        to: new_user.email,
        template: 'changePasswordCode',
        subject: 'Your One-Time Code for Password Reset',
        context: {
          code: code,
          name:
            new_user.first_name + ' ' + new_user.last_name || new_user.email,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
