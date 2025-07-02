import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/users.entity';
import { ROLES } from 'common/constants/enum/roles.enum';
import { SignUpDto } from 'modules/auth/dtos/auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { CouponsService } from 'modules/coupons/coupons.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    readonly couponService: CouponsService,
  ) {}

  async verifyEmail(email: string, verify_code: number) {
    const data = await this.userRepo.update(
      {
        email,
        verify_code,
        email_verified: false,
      },
      {
        email_verified: true,
        verify_code: null,
      },
    );
    if (data.affected === 0) {
      throw new ConflictException('Email or code is invalid');
    }
    return true;
  }
  async isExisting(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    if (user) {
      throw new ConflictException('Email already exists');
    }
  }
  async getSavedCoupons(user_id: number): Promise<CouponEntity[]> {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: ['saved_coupons'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user.saved_coupons;
  }

  async saveCouponForUser(id: number, user_id: number) {
    const couponData = await this.couponService.findOne(id);
    const coupon = Object.assign(new CouponEntity(), couponData);

    const user = await this.userRepo.findOne({
      where: {
        id: user_id,
      },
      relations: ['saved_coupons'],
    });

    const already_saved = user.saved_coupons.some(
      (c: CouponEntity) => c.id === id,
    );
    if (already_saved) {
      user.saved_coupons = user.saved_coupons.filter((c) => c.id !== id);
    } else {
      user.saved_coupons.push(coupon);
    }

    await this.userRepo.save(user);
  }
  async hasSuperAdmin(): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { role: ROLES.ADMIN },
    });
    if (user) {
      throw new ConflictException('Cannot have more than 1 admin account');
    }
  }
  async createRegularUser(
    data: SignUpDto,
    manager: EntityManager,
  ): Promise<UserEntity> {
    try {
      const hashedPassword = await this.hashPassword(data.password);
      const user = this.userRepo.create({
        ...data,
        role: ROLES.USER,
        password: hashedPassword,
      });

      // generate a random code with 6 number
      const verify_code = Math.round(100000 + Math.random() * 900000);

      // send code to email
      user.verify_code = verify_code;
      return await manager.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('Email already exist');
        }
      }
      throw error;
    }
  }
  async createSuperAdmin({
    email,
    first_name,
    last_name,
    password,
  }: SignUpDto): Promise<UserEntity> {
    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      role: ROLES.ADMIN,
      first_name,
      last_name,
      email_verified: true,
    });

    return await this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email, deleted_at: null },
      select: ['id', 'email', 'password', 'role', 'email_verified'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    await this.validatePassword(password, user.password);
    delete user.password;
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
      .createQueryBuilder('user')
      .where('user.id = :user_id', { user_id })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  async updateAccount(user_id: number, data: UpdateUserDto) {
    const result = await this.userRepo
      .createQueryBuilder('user')
      .update(UserEntity)
      .set(data)
      .where('id = :user_id', { user_id })
      .andWhere('email_verified = :email_verified', {
        email_verified: true,
      })
      .andWhere('deleted_at IS NULL')
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException('Account not found');
    }
    return {
      id: user_id,
      ...data,
    };
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
      .select(['u.id', 'u.first_name', 'u.last_name', 'u.email', 'u.role'])
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
