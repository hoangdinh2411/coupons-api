import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/users.entity';
import { UserDto } from 'modules/auth/dtos/auth.dto';
import { ROLES } from 'common/constants/enum/roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async isExisting(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (user) {
      throw new ConflictException('Email already exists');
    }
  }
  async hasSuperAdmin(): Promise<void> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('users.role = :role', {
        role: ROLES.ADMIN,
      })
      .getOne();
    if (user) {
      throw new ConflictException('Can only have one super admin');
    }
  }
  async createNewUser(data: UserDto): Promise<UserEntity> {
    const user = new UserEntity();
    const hashedPassword = await this.hashPassword(data.password);
    user.email = data.email;
    user.password = hashedPassword;

    // generate a random code with 6 number
    const verifying_code = Math.round(100000 + Math.random() * 900000);

    // send code to email
    user.verifying_code = verifying_code;
    return await this.userRepo.save(user);
  }
  async createSuperAdmin(data: UserDto): Promise<UserEntity> {
    const hashedPassword = await this.hashPassword(data.password);
    const user = this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: ROLES.ADMIN,
    });
    return await this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email, deleted_at: null },
      select: ['user_id', 'email', 'password', 'role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    await this.validatePassword(password, user.password);
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }
  async validatePassword(password: string, hash: string) {
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) {
      throw new ConflictException('Password is incorrect');
    }
  }

  async verifyUser(user_id: number): Promise<UserEntity> {
    return this.userRepo
      .createQueryBuilder('t')
      .where('t.user_id = :user_id', { user_id })
      .andWhere('t.deleted_at IS NULL')
      .leftJoin('t.company', 'company', 'company.deleted_at IS NULL')
      .addSelect(['company.company_id', 'company.name', 'company.slug'])
      .getOne();
  }

  async getUser(user_id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { user_id: user_id },
      select: ['user_id', 'email', 'role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getProfile(user_id: number): Promise<UserEntity> {
    return this.userRepo
      .createQueryBuilder('t')
      .select(['t.user_id', 't.full_name', 't.last_name', 't.email', 't.roles'])
      .leftJoin('t.company', 'company')
      .addSelect(['company.company_id', 'company.name'])
      .where('t.user_id = :user_id AND t.deleted_at IS NULL', {
        user_id: user_id,
      })
      .getOne();
  }

  async updateRole(new_role: ROLES, user: UserEntity): Promise<void> {
    user.role = new_role;
    await this.userRepo.save(user);
  }

  async delete(user_id: number): Promise<void> {
    await this.userRepo.findOne({
      where: { user_id },
      relations: ['company'],
    });
  }
}
