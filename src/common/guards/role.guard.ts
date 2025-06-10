import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredRoles = this.reflector.get<ROLES[]>(
      ROLE_KEY,
      context.getHandler(),
    );
    const user = context.switchToHttp().getRequest().user;
    if (!user.roles) {
      throw new UnauthorizedException('This account missing role');
    }
    if (!requiredRoles && user) {
      return true;
    }

    this.matchRoles(requiredRoles, user.role);
    return true;
  }

  matchRoles(requiredRoles: ROLES[], userRole: ROLES) {
    const result = requiredRoles.includes(userRole);
    if (!result) {
      throw new UnauthorizedException('Access denied');
    }
  }
}
