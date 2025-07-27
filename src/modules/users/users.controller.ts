import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { UserEntity } from './entities/users.entity';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UserService } from './services/users.service';
import { Roles } from 'common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ROLES } from 'common/constants/enums';

@ApiTags('Users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 200, description: 'Success' })
@Controller('users')
@ApiSecurity('bearer')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'user profile retrieved successfully',
  })
  @Get('profile')
  @Roles(ROLES.ADMIN, ROLES.PARTNER, ROLES.USER)
  @HttpCode(200)
  profile(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return this.userService.getProfile(user.id);
  }

  @Patch('profile')
  @HttpCode(200)
  @Roles(ROLES.ADMIN, ROLES.PARTNER, ROLES.USER)
  async update(@CurrentUser() user: UserEntity, @Body() data: UpdateUserDto) {
    return await this.userService.updateAccount(user.id, data);
  }

  @Delete()
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  async deleteAccount(@CurrentUser() user: UserEntity) {
    await this.userService.delete(user.id);
  }

  @Post('my-coupons')
  @Roles(ROLES.USER)
  saveCoupon(
    @CurrentUser() user: UserEntity,
    @Body() { coupon_id }: UpdateUserDto,
  ) {
    return this.userService.saveCouponForUser(+coupon_id, user);
  }

  @Get('my-coupons')
  @HttpCode(200)
  @Roles(ROLES.PARTNER, ROLES.USER)
  async getMyCoupons(@CurrentUser() user: UserEntity) {
    return await this.userService.getSavedCoupons(+user.id);
  }
}
