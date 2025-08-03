import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

export class UpdateStoreDto extends BaseDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Store abc',
    description: 'Store name',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'Store do something',
    description: 'Description about the store',
  })
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: 25,
    description:
      'The coupon caps the discount at 58 % off the item or order total.',
  })
  max_discount_pct: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'Keywords for store that using for SEO',
  })
  keywords: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'https://www.example.com',
    description: 'The website url for the store',
  })
  url: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one category ID is required' })
  @IsInt({ each: true, message: 'Each category must be an integer' })
  @Type(() => Number)
  @ApiProperty({
    type: () => 'number',
    default: [1, 2],
    description: 'Category id',
  })
  categories: number[];

  @IsNumber()
  @IsOptional()
  rating: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'store-abc-c',
    description: 'Slug will be generated on frontend',
  })
  slug: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FAQDto)
  @ApiProperty({
    default: [FAQDto],
    description: 'FAQs ',
  })
  faqs: FAQDto[];
}
