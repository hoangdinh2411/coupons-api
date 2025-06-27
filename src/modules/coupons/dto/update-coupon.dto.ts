import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
  Validate,
  IsOptional,
  IsArray,
  IsInt,
  ArrayNotEmpty,
} from 'class-validator';
import { CouponType } from 'common/constants/enum/coupon.enum';
import { IsAfterStartDate } from './coupon.dt';
import { Type } from 'class-transformer';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'Coupon title',
    description: 'Coupon title',
  })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'offer_link',
    description: 'offer_link',
  })
  offer_link: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Code of coupon',
  })
  code: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Offer detail ',
    description: 'Detail of offer',
  })
  offer_detail: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Store id',
  })
  store_id: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one category ID is required' })
  @IsInt({ each: true, message: 'Each category must be an integer' })
  @Type(() => Number)
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Category id',
  })
  categories: number[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: () => 'number',
    default: 0,
    description: 'Rating',
  })
  rating: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: () => 'boolean',
    default: false,
    description: 'Is coupon exclusive?',
  })
  is_exclusive: boolean;

  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'start date must be in the format YYYY/MM/DD',
  })
  @IsOptional()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  start_date: string;

  @IsString()
  @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
    message: 'expired date must be in the format YYYY/MM/DD',
  })
  @IsOptional()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  expire_date: string;
  @Validate(IsAfterStartDate) private readonly _range!: never;

  @IsEnum(CouponType, {
    message: 'Not support this type',
  })
  @IsOptional()
  type: CouponType;
}
