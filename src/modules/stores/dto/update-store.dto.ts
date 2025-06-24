import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SeoDto } from 'common/constants/common.dto';

export class UpdateStoreDto extends SeoDto {
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

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'icon-1',
    description: 'Image with format Base64',
  })
  // @IsOptional()
  image_bytes: string;

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

  @IsNumber()
  @IsOptional()
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
