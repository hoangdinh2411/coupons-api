import { VerifyCodeType } from 'common/constants/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CodeForVerifyEmailStrategy } from '../strategy/code-for-verify-email.strategy';
import { CodeForChangePasswordStrategy } from '../strategy/code-for-change-password.strategy';

@Injectable()
export class VerifyCodeFactory {
  constructor(
    private readonly codeForChangePasswordStrategy: CodeForChangePasswordStrategy,
    private readonly codeForVerifyEmailStrategy: CodeForVerifyEmailStrategy,
  ) {}

  getStrategy(type: VerifyCodeType) {
    switch (type.toUpperCase() as VerifyCodeType) {
      // case ROLES.PARTNER:
      case VerifyCodeType.FORGET_PASSWORD:
        return this.codeForChangePasswordStrategy;
      case VerifyCodeType.VERIFY_ACCOUNT:
        return this.codeForVerifyEmailStrategy;
      default:
        throw new BadRequestException('Not support to this verify code type');
    }
  }
}
