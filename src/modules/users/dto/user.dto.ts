import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

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

  @IsEmail()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'first namename',
    description: 'First name of user',
  })
  first_name: string = '';
  @IsEmail()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'Last namename',
    description: 'Last name of user',
  })
  last_name: string = '';
}
