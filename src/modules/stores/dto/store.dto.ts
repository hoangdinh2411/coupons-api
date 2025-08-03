import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'store-abc-c',
    description: 'Slug will be generated on frontend',
  })
  slug: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FAQDto)
  @ApiProperty({
    type: () => FAQDto,
    default: [
      {
        question: 'question 1?',
        answer: 'answer 1',
      },
      {
        question: 'question 2?',
        answer: 'answer 2',
      },
    ],
    description: 'FAQs ',
  })
  faqs: FAQDto[];

  @IsNumber()
  @IsOptional()
  rating: number;
}
