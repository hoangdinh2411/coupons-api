import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { UserEntity } from 'modules/users/entities/users.entity';
import { NewUserDto } from './dtos/auth.dto';
import { UserService } from 'modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signUp(data: NewUserDto) {
    await this.userService.createNewUser(data);
    return;
  }

  async signUpForSuperAdmin(data: NewUserDto) {
    await this.userService.hasSuperAdmin();
    await this.userService.createSuperAdmin(data);
  }
  
  async generateToken(user: UserEntity) {
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      { expiresIn: '1h' },
    );
    return token;
  }

  checkForbiddenWordsInEmail(email: string) {
    const regex = /(admin|super-admin)/i;
    if (regex.test(email)) {
      throw new BadRequestException('Invalid email');
    }
  }

  async verifyToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token);
    log(decoded);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    return decoded;
  }

  comparePasswordWithConfirmPassword(
    password: string,
    confirmPassword: string,
  ) {
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
  }
}
