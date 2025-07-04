import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from 'modules/users/entities/users.entity';
import { VerifyCodeStrategy } from '../interface/verify-code-strategy.inteface';
import { TokenService } from '../services/token.service';

@Injectable()
export class CodeForChangePasswordStrategy implements VerifyCodeStrategy {
  constructor(private readonly tokenService: TokenService) {}

  async execute(user: UserEntity) {
    const token = await this.tokenService.generateResetPasswordToken(user);
    if (token) {
      return token;
    } else {
      throw new InternalServerErrorException(
        'Cannot generate session to change password',
      );
    }
  }
}
