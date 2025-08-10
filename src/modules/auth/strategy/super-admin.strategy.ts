import { SignUpStrategy } from '../interface/signup-strategy.interface';
import { SignUpDto } from '../dtos/auth.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from 'modules/users/services/users.service';
import { ROLES } from 'common/constants/enums';

@Injectable()
export class SuperAdminStrategy implements SignUpStrategy {
  constructor(private readonly userService: UserService) {}

  async execute(data: SignUpDto): Promise<any> {
    if (data.role.toUpperCase() === ROLES.ADMIN) {
      await this.userService.hasSuperAdmin();
    }
    await this.userService.createSuperAdmin(data);
    return true;
  }
}
