import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class UserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'email@gmail.com',
    description: 'Email of the organization',
  })
  @Matches(/\S/, { message: 'Email cannot be empty or whitespace only' })
  email: string = '';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'password',
    description: 'Password for the account of the organization',
  })
  @Matches(/\S/, { message: 'Password cannot be empty or whitespace only' })
  password: string = '';
}

export class NewUserDto extends UserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'display_name',
    description: 'Confirm password  of the organization',
  })
  @Matches(/\S/, {
    message: 'Confirm password  cannot be empty or whitespace only',
  })
  confirm_password: string = '';
}

export class UpdateUserDto extends UserDto {}
