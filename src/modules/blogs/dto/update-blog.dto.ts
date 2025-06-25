import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { SeoDto } from 'common/constants/common.dto';
import {
  IsNotEmptyDraftContent,
  RawDraftContentState,
} from 'common/helpers/IsNotEmptyDraftContent';

export class UpdateBlogDto extends SeoDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'blog title',
  })
  title: string;

  @IsNotEmptyDraftContent()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'content content content',
    description: 'blog content',
  })
  content: RawDraftContentState;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'keywords that using for SEO',
  })
  keywords: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'base 64 url',
    description: 'Image"',
  })
  image_bytes: string;

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
}
