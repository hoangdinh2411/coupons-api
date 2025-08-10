import { ROLES } from 'common/constants/enums';
import { RegularUserStrategy } from '../strategy/regular-user.strategy';
import { SuperAdminStrategy } from '../strategy/super-admin.strategy';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SignUpStrategyFactory {
  constructor(
    private readonly regular: RegularUserStrategy,
    private readonly superAdmin: SuperAdminStrategy,
  ) {}

  getStrategy(type: ROLES) {
    if (!type) {
      type = ROLES.USER;
    }
    switch (type.toUpperCase() as ROLES) {
      // case ROLES.PARTNER:
      case ROLES.ADMIN:
      case ROLES.PARTNER:
        return this.superAdmin;
      case ROLES.USER:
        return this.regular;
      default:
        throw new BadRequestException(
          'Not support to create user with this role',
        );
    }
  }
}
