import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'common/guards/localAuth.guard';
import { Public } from 'common/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto, AuthDto, VerifyEmailDto } from './dtos/auth.dto';
import { UserService } from 'modules/users/users.service';
// import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'Sign up',
    description: 'Sign up',
  })
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully',
  })
  @Public()
  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    this.authService.comparePasswordWithConfirmPassword(
      body.password,
      body.confirm_password,
    );
    this.authService.checkForbiddenWordsInEmail(body.email);
    const new_user = await this.userService.createNewUser(body);
    await this.authService.signUp(new_user);
  }

  @ApiOperation({
    summary: 'Sign up account for super admin',
    description: 'Sign up account for super admin',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin signed up successfully',
  })
  @Public()
  @Post('sign-up/super-admin')
  async signUpForSuperAdmin(@Body() body: SignUpDto) {
    this.authService.comparePasswordWithConfirmPassword(
      body.password,
      body.confirm_password,
    );
    await this.userService.hasSuperAdmin();
    await this.userService.createSuperAdmin(body);
    return true;
  }

  @ApiOperation({
    summary: 'Sign in',
    description: 'Sign in with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
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
    }
  }

  @Public()
  @Patch('verify-account')
  @HttpCode(200)
  async verifyAccount(@Body() data: VerifyEmailDto) {
    return this.userService.verifyEmail(data.email, data.code);
  }
}
