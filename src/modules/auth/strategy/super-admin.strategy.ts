import { SignUpStrategy } from '../interface/signup-strategy.interface';
import { SignUpDto } from '../dtos/auth.dto';
import { Injectable } from '@nestjs/common';
import { UserService } from 'modules/users/services/users.service';

@Injectable()
export class SuperAdminStrategy implements SignUpStrategy {
  constructor(private readonly userService: UserService) {}

  async execute(data: SignUpDto): Promise<any> {
    await this.userService.hasSuperAdmin();
    await this.userService.createSuperAdmin(data);
    return true;
  }
}
