import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  comparePassword(pass: string, confirm: string) {
    if (pass !== confirm) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
  }
}
