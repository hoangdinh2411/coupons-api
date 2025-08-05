import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordOnProfile {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'password',
    description: 'Password for the account',
  })
  @Matches(/\S/, { message: 'Password cannot be empty or whitespace only' })
  password: string = '';

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'password',
    description: 'Confirm password',
  })
  @Matches(/\S/, { message: 'Password cannot be empty or whitespace only' })
  confirm_password: string = '';
}
