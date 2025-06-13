import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsEndAfterStart } from './coupon.dt';

export class FilterCouponDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Coupon title',
    description: 'Coupon title',
  })
  title: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: [Number],
    default: 1,
    description: 'Store id',
  })
  store: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: [1],
    description: 'array of Category id ( from store)',
  })
  categories: number[];

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  expire_date: string;
  @Validate(IsEndAfterStart) private readonly _range!: never;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    default: ['AI', 'programming'],
    description: 'tags  to filter coupon (from store)',
  })
  tags: string[];
}
