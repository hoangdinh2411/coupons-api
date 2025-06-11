import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class StoreDto {
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

  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'https://image.url',
    description: 'Image url',
  })
  image_url: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({
    type: () => 'number',
    default: 25,
    description:
      'The coupon caps the discount at 58 % off the item or order total.',
  })
  max_discount_pct: number;

  @IsString()
  @ApiProperty({
    type: () => 'array',
    default: '[AI, programming]',
    description: 'Keywords for store that using for SEO',
  })
  keywords: string[];
  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'https://www.example.com',
    description: 'The website url for the store',
  })
  url: string;

  slug: string;
}
