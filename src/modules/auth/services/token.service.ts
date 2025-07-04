import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'modules/users/entities/users.entity';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: UserEntity) {
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        type: 'sign-in',
      },
      { expiresIn: '1h' },
    );
    return token;
  }
  async generateResetPasswordToken(user: UserEntity) {
    const { id } = user;
    const token = await this.jwtService.signAsync(
      {
        id,
        type: 'change-password',
      },
      { expiresIn: '10m' },
    );
    return token;
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Reset token is invalid',
      );
    }
  }
}
