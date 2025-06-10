import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { UserEntity } from './entities/users.entity';
import { CurrentUser } from 'common/decorators/currentUser.decorator';
import { UserService } from './users.service';

@ApiTags('Users')
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 200, description: 'Success', type: UserEntity })
@Controller('users')
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
  @HttpCode(200)
  profile(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return this.userService.getProfile(user.user_id);
  }

  @Delete()
  @HttpCode(200)
  async deleteAccount(@CurrentUser() user: UserEntity) {
    await this.userService.delete(user.user_id);
  }
}
