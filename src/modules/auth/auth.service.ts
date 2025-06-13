import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { UserEntity } from 'modules/users/entities/users.entity';
import { SignUpDto, VerifyEmailDto } from './dtos/auth.dto';
import { UserService } from 'modules/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async signUp(new_user: UserEntity) {
    try {
      await this.mailerService.sendMail({
        to: new_user.email,
        template: 'example',
        subject: 'Verify email',
        context: {
          code: new_user.verifying_code,
          username: new_user.email,
        },
      });
      return {
        id: new_user.id,
        email: new_user.email,
      };
    } catch (error) {
      throw error;
    }
  }

  async generateToken(user: UserEntity) {
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      { expiresIn: '1h' },
    );
    return token;
  }

  checkForbiddenWordsInEmail(email: string) {
    const regex = /(admin|super-admin)/i;
    if (regex.test(email)) {
      throw new BadRequestException('Invalid email');
    }
  }

  async verifyToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token);
    log(decoded);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    return decoded;
  }

  comparePasswordWithConfirmPassword(
    password: string,
    confirmPassword: string,
  ) {
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
  }
}
