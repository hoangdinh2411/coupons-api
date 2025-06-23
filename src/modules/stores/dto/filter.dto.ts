import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterStoreDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Store abc',
    description: 'Search text',
  })
  search_text: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @ApiProperty({
    type: () => 'number',
    default: 25,
    description:
      'The coupon caps the discount at 58 % off the item or order total.',
  })
  max_discount_pct: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Rating',
  })
  rating: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'page',
  })
  page: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: () => 'array',
    default: [1, 2, 3],
    description: 'an array of category ids',
  })
  categories: number[];
}
