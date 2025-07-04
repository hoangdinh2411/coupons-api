import { SignUpStrategy } from '../interface/signup-strategy.interface';
import { SignUpDto } from '../dtos/auth.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'modules/users/services/users.service';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { user, verify_code } = await this.userService.createRegularUser(
        data,
        queryRunner.manager,
      );
      await this.emailerService.sendVerifyCode(user, verify_code);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
