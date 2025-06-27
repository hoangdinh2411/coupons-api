import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';

export class StoreDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'Store abc',
    description: 'Store name',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'Store do something',
    description: 'Description about the store',
  })
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 25,
    description:
      'The coupon caps the discount at 58 % off the item or order total.',
  })
  max_discount_pct: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'Keywords for store that using for SEO',
  })
  keywords: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'https://www.example.com',
    description: 'The website url for the store',
  })
  url: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Category id',
  })
  category_id: number;

  @IsNumber()
  @IsOptional()
  rating: number;
  slug: string;
}
