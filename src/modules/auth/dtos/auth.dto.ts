import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthDto {
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
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'password',
    description: 'Password for the account',
  })
  @Matches(/\S/, { message: 'Password cannot be empty or whitespace only' })
  password: string = '';
}

export class SignUpDto extends AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'display_name',
    description: 'Confirm password ',
  })
  @Matches(/\S/, {
    message: 'Confirm password  cannot be empty or whitespace only',
  })
  confirm_password: string = '';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'first name',
    description: 'First name',
  })
  first_name: string = '';
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'last name',
    description: 'Last Name',
  })
  last_name: string = '';
}
