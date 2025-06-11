import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
    const user = await this.userRepo.findOne({
      where: { role: ROLES.ADMIN },
    });
    if (user) {
      throw new ConflictException('Cannot have more than 1 admin account');
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
    try {
      return await this.userRepo.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Email already exist');
        }
      }
      return error;
    }
  }
  async createSuperAdmin(data: UserDto): Promise<UserEntity> {
    const hashedPassword = await this.hashPassword(data.password);
    const user = {
      email: data.email,
      password: hashedPassword,
      role: ROLES.ADMIN,
      full_name: '',
      last_name: '',
      email_verified: true,
    };
    return await this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email, deleted_at: null },
      select: ['id', 'email', 'password', 'role'],
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
      .createQueryBuilder('u')
      .where('u.id = :user_id', { user_id })
      .andWhere('u.deleted_at IS NULL')
      .getOne();
  }

  async getUser(user_id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      select: ['id', 'email', 'role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getProfile(user_id: number): Promise<UserEntity> {
    return this.userRepo
      .createQueryBuilder('u')
      .select(['u.user_id', 'u.full_name', 'u.last_name', 'u.email', 'u.role'])
      .where('u.id = :user_id AND u.deleted_at IS NULL', {
        user_id,
      })
      .getOne();
  }

  async updateRole(new_role: ROLES, user: UserEntity): Promise<void> {
    user.role = new_role;
    await this.userRepo.save(user);
  }

  async delete(user_id: number): Promise<void> {
    await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['company'],
    });
  }
}
