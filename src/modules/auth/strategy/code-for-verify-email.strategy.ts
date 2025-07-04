import { Injectable } from '@nestjs/common';
import { UserEntity } from 'modules/users/entities/users.entity';
import { UserService } from 'modules/users/services/users.service';
import { VerifyCodeStrategy } from '../interface/verify-code-strategy.inteface';

@Injectable()
export class CodeForVerifyEmailStrategy implements VerifyCodeStrategy {
  constructor(private readonly userService: UserService) {}

  async execute(user: UserEntity) {
    await this.userService.setEmailIsVerified(user);
    return '';
  }
}
