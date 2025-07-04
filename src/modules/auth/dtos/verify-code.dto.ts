import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'email@gmail.com',
    description: 'Email of user',
  })
  @Matches(/\S/, { message: 'Email cannot be empty or whitespace only' })
  email: string = '';
}

export class VerifyCodeDto extends ForgetPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 111111,
    description: 'Code to verify changing password process',
  })
  code: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'type',
    default: 'type',
    description: 'type of request',
  })
  @Matches(/\S/, { message: 'Email cannot be empty or whitespace only' })
  type: string = '';
}
