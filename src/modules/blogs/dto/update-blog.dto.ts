import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

export class UpdateBlogDto extends BaseDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'blog title',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'content content content',
    description: 'blog content',
  })
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'keywords that using for SEO',
  })
  keywords: string[];

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'topic  id',
  })
  topic_id: number;
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'rating',
  })
  rating: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: () => 'boolean',
    default: 1,
    description: 'is_published',
  })
  is_published: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: () => 'boolean',
    default: 1,
    description: 'is_indexed',
  })
  is_indexed: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'blog-a-b-c',
    description: 'slug',
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
