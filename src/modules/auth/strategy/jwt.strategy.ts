import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserService } from 'modules/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JWTAuthStrategy.tokenExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  private static tokenExtractor(req: Request): string | null {
    let token = null;
    if (req && 'token' in req.cookies) {
      token = req.cookies.token;
    }
    return token;
  }
  async validate(payload: JwtPayload) {
    if (payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.userService.verifyUser(payload.id);

    if (!user) {
      throw new UnauthorizedException('Token invalid. Account not found');
    }
    return user;
  }
}
