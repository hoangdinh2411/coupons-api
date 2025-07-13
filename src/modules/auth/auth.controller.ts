import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  HttpCode,
  InternalServerErrorException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from 'common/guards/localAuth.guard';
import { Public } from 'common/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto, AuthDto } from './dtos/auth.dto';
import { SignUpStrategyFactory } from './factory/signup-strategy.factory';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'modules/users/services/users.service';
import { generateCode } from 'common/helpers/code';
import { EmailerService } from 'modules/emailer/emailer.service';
import { DataSource } from 'typeorm';
import { ROLES, VerifyCodeType } from 'common/constants/enums';
import { ForgetPasswordDto, VerifyCodeDto } from './dtos/verify-code.dto';
import { VerifyCodeFactory } from './factory/verify-code-strategy.factory';
import { TokenService } from './services/token.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthService } from './services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpStrategyFactory: SignUpStrategyFactory,
    private readonly verifyCodeFactory: VerifyCodeFactory,
    private readonly userService: UserService,
    private configService: ConfigService,
    private readonly emailerService: EmailerService,
    private readonly dataSource: DataSource,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Sign up',
    description: 'Sign up',
  })
  @ApiResponse({
    status: 201,
    description: ' signed up successfully',
  })
  @Post('sign-up')
  @Public()
  async signUp(@Query('type') type: ROLES, @Body() body: SignUpDto) {
    this.authService.comparePassword(body.password, body.confirm_password);
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
    const token = await this.tokenService.generateToken(req.user);
    // const configService = new ConfigService();
    // const NODE_ENV = configService.get('NODE_ENV');
    if (token) {
      const NODE_ENV = this.configService.get<string>('NODE_ENV') || '';
      //io
      res.cookie('token', token, {
        httpOnly: NODE_ENV === 'production',
        secure: NODE_ENV === 'production', // enable when client is served over https
        sameSite: 'lax', // enable when client is served over https
        path: '/',
        maxAge: 1000 * 60 * 60 * 24,
      });
      return {
        ...req.user,
        token,
      };
    } else {
      throw new InternalServerErrorException('Cannot generate token');
    }
  }

  @ApiOperation({
    summary: 'Forget password',
    description:
      'Send email, then get code on email and change password after code is verified on client',
  })
  @ApiResponse({
    status: 200,
    description: 'Get code on email success',
  })
  @Public()
  @HttpCode(200)
  @Post('forget-password')
  async forgetPassword(@Body() body: ForgetPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const code = generateCode();
      const user = await this.userService.saveCode(body.email, code);
      await this.emailerService.sendCodeForChangePassword(user, code);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @ApiOperation({
    summary: 'Verify code ',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
  })
  @Public()
  @HttpCode(200)
  @Post('verify-code')
  async verifyForgetPasswordCode(@Body() body: VerifyCodeDto) {
    const user = await this.userService.verifyCode(body);

    const strategy = this.verifyCodeFactory.getStrategy(
      body.type as VerifyCodeType,
    );
    const token = await strategy.execute(user);

    return {
      type: body.type,
      token,
    };
  }

  @ApiOperation({
    summary: 'Change password',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
  })
  @Public()
  @HttpCode(200)
  @Post('change-pass')
  async changePassword(@Body() body: ChangePasswordDto) {
    this.authService.comparePassword(body.password, body.confirm_password);
    const decoded = await this.tokenService.verifyToken(body.reset_token);
    if (!decoded.id) {
      throw new BadRequestException('Invalid change password token');
    }

    await this.userService.updateNewPassword(+decoded.id, body.password);
    return true;
  }
}
