import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class UserDto {
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

  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'first name',
    description: 'First name of user',
  })
  first_name: string = '';

  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'Last namename',
    description: 'Last name of user',
  })
  last_name: string = '';
}

export class VerifyEmailDto extends PickType(UserDto, ['email'] as const) {
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      message: 'Code must be a positive number',
    },
  )
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 123456,
    description: 'Code to verify email ',
  })
  code: number;
}
