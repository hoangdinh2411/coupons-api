import { SignUpStrategy } from '../interface/signup-strategy.interface';
import { SignUpDto } from '../dtos/auth.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'modules/users/users.service';
import { EmailerService } from 'modules/emailer/emailer.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RegularUserStrategy implements SignUpStrategy {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly emailerService: EmailerService,
  ) {}

  async execute(data: SignUpDto): Promise<any> {
    const regex = /(admin|super-admin)/i;
    if (regex.test(data.email)) {
      throw new BadRequestException('Invalid email');
    }
    const queryBuilder = this.dataSource.createQueryRunner();
    await queryBuilder.connect();
    await queryBuilder.startTransaction();
    try {
      const new_user = await this.userService.createRegularUser(data);
      await this.emailerService.sendVerifyCode(new_user);
      queryBuilder.commitTransaction();
      return true;
    } catch (error) {
      await queryBuilder.rollbackTransaction();
      throw error;
    } finally {
      await queryBuilder.release();
    }
  }
}
