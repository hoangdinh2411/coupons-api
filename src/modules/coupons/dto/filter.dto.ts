import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterCouponDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Coupon title',
    description: 'Coupon title',
  })
  search_text: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [Number],
    default: 1,
    description: 'Store ids',
  })
  stores: number[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: [1],
    description: 'array of Category id ( from store)',
  })
  categories: number[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    default: [0, 1, 2],
    description: 'Status',
  })
  status: number[];

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    default: 1,
    description: 'Number',
  })
  page: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  @ApiProperty({
    default: 1,
    description: 'Number',
  })
  rating: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    default: false,
    description: 'is_verified',
  })
  is_verified: boolean;
}
