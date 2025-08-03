import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MyCouponDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: 'Coupon id',
    description: 'Coupon id that using to find coupon',
  })
  coupon_id: number;
}
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'first name',
    description: 'First name of user',
  })
  first_name: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Last name',
    description: 'Last name of user',
  })
  last_name: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'facebook',
    description: 'facebook',
  })
  facebook: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'youtube',
    description: 'youtube',
  })
  youtube: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'instagram',
    description: 'instagram',
  })
  instagram: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'linkedin',
    description: 'linkedin',
  })
  linkedin: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'description',
    description: 'description',
  })
  description: string = '';
}
