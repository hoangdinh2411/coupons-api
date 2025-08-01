import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity';
import { SignUpDto } from 'modules/auth/dtos/auth.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CouponEntity } from 'modules/coupons/entities/coupon.entity';
import { CouponsService } from 'modules/coupons/coupons.service';
import { generateCode } from 'common/helpers/code';
import { VerifyCodeDto } from 'modules/auth/dtos/verify-code.dto';
import { ROLES, VerifyCodeType } from 'common/constants/enums';
import { BcryptService } from './bcrypt.service';
import { UpdateCouponDto } from 'modules/coupons/dto/update-coupon.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    readonly couponService: CouponsService,
    readonly bcryptService: BcryptService,
  ) {}

  async setEmailIsVerified(user: UserEntity) {
    user.verify_code = null;
    user.email_verified = true;
    await this.userRepo.save(user);
    return true;
  }
  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email, deleted_at: null },
    });
    if (!user) {
      throw new ConflictException('Email is incorrect');
    }
    return user;
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

  async saveCouponForUser(id: number, userData: UserEntity) {
    const couponData = await this.couponService.findOne(id);
    const coupon = Object.assign(new CouponEntity(), couponData);

    const user = await this.userRepo.findOne({
      where: {
        id: userData.id,
      },
      relations: ['saved_coupons'],
    });

    const already_saved = user.saved_coupons.some(
      (c: CouponEntity) => c.id === id,
    );
    let total_interested_users = coupon.total_interested_users;
    if (already_saved) {
      user.saved_coupons = user.saved_coupons.filter((c) => c.id !== id);
      total_interested_users =
        total_interested_users > 0 ? total_interested_users - 1 : 0;
    } else {
      user.saved_coupons.push(coupon);
      total_interested_users += 1;
    }

    await this.userRepo.save(user);
    await this.couponService.update(
      coupon.id,
      {
        total_interested_users: total_interested_users,
      } as UpdateCouponDto,
      userData,
    );
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
  ): Promise<{
    user: UserEntity;
    verify_code: number;
  }> {
    try {
      const hashedPassword = await this.bcryptService.hashData(data.password);
      const user = this.userRepo.create({
        ...data,
        role: ROLES.USER,
        password: hashedPassword,
      });

      // generate a random code with 6 number
      const verify_code = generateCode();
      const hashed_code = await this.bcryptService.hashData(
        verify_code.toString(),
      );
      // send code to email
      user.verify_code = hashed_code;
      const saved_data = await manager.save(user);
      return {
        user: saved_data,
        verify_code,
      };
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
    const hashedPassword = await this.bcryptService.hashData(password);
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
      select: [
        'password',
        'id',
        'role',
        'email_verified',
        'email',
        'first_name',
        'last_name',
      ],
    });
    if (!user) {
      throw new BadRequestException('Email is incorrect');
    }
    const is_valid = await this.bcryptService.compareData(
      password,
      user.password,
    );
    if (!is_valid) {
      throw new BadRequestException('Password not correct');
    }
    delete user.password;
    return user;
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

  async saveCode(email: string, code: number) {
    const user = await this.userRepo.findOne({
      where: {
        email,
        deleted_at: null,
      },
    });
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    user.verify_code = await this.bcryptService.hashData(code.toString());
    return this.userRepo.save(user);
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
      .select([
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.role',
        'u.description',
        'u.youtube',
        'u.facebook',
        'u.linkedin',
        'u.instagram',
      ])
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

  async verifyCode({ email, code, type }: VerifyCodeDto) {
    const user = await this.getUserByEmail(email);
    if (type === VerifyCodeType.VERIFY_ACCOUNT && user.email_verified) {
      throw new ConflictException('Email is verified');
    }

    if (type === VerifyCodeType.FORGET_PASSWORD && !user.verify_code) {
      throw new ConflictException(
        'No verification code found. Please request a new one',
      );
    }
    const is_correct_code = await this.bcryptService.compareData(
      code.toString(),
      user.verify_code,
    );

    if (!is_correct_code) {
      throw new BadRequestException('Code is incorrect');
    }

    return user;
  }

  async updateNewPassword(user_id: number, new_pass: string) {
    const user = await this.getUser(user_id);
    if (!user.verify_code) {
      throw new ConflictException(
        'No verification code found. Please request a new one',
      );
    }
    const hashedPassword = await this.bcryptService.hashData(new_pass);
    user.password = hashedPassword;
    user.verify_code = null;

    return await this.userRepo.save(user);
  }
}
