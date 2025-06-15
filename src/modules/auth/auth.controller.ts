import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  Patch,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'common/guards/localAuth.guard';
import { Public } from 'common/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto, AuthDto, VerifyEmailDto } from './dtos/auth.dto';
import { UserService } from 'modules/users/users.service';
import { ROLES } from 'common/constants/enum/roles.enum';
import { SignUpStrategyFactory } from './factory/signup-strategy.factory';
// import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly signUpStrategyFactory: SignUpStrategyFactory,
  ) {}

  @ApiOperation({
    summary: 'Sign up',
    description: 'Sign up',
  })
  @ApiResponse({
    status: 201,
    description: ' signed up successfully',
  })
  @Public()
  @Post('sign-up/:type')
  async signUp(@Param('type') type: ROLES, @Body() body: SignUpDto) {
    this.authService.comparePasswordWithConfirmPassword(
      body.password,
      body.confirm_password,
    );
    
    const strategy = this.signUpStrategyFactory.getStrategy(type);
    return await strategy.execute(body);
  }


  @ApiOperation({
    summary: 'Sign in',
    description: 'Sign in with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    example: {
      success: true,
      data: {
        id: 3,
        email: 'example@gmail.com',
        role: 'role',
        email_verified: true,
      },
    },
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  @ApiBody({
    type: AuthDto,
  })
  async signIn(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.generateToken(req.user);
    // const configService = new ConfigService();
    // const NODE_ENV = configService.get('NODE_ENV');
    if (token) {
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // enable when client is served over https
        sameSite: 'none', // enable when client is served over https
        path: '/',
        maxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      return req.user;
    } else {
      throw new InternalServerErrorException('Cannot generate token');
    }
  }

  @Public()
  @Patch('verify-account')
  @HttpCode(200)
  async verifyAccount(@Body() data: VerifyEmailDto) {
    return this.userService.verifyEmail(data.email, data.code);
  }
}
