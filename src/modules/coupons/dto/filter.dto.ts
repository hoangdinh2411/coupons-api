import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Validate,
} from 'class-validator';
import { IsAfterStartDate } from './coupon.dt';

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
    message: 'start date must be in the format YYYY/MM/DD',
  })
  @IsOptional()
  @ApiProperty({
    default: '2025-12-05',
    description: 'When does coupon end?',
  })
  expire_date: string;
  @Validate(IsAfterStartDate) private readonly _range!: never;

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
