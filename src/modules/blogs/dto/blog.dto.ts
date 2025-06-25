import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SeoDto } from 'common/constants/common.dto';
import {
  IsNotEmptyDraftContent,
  RawDraftContentState,
} from 'common/helpers/IsNotEmptyDraftContent';

export class BlogDto extends SeoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Post title',
  })
  title: string;

  @IsNotEmptyDraftContent()
  @ApiProperty({
    type: () => 'string',
    default: 'content content content',
    description: 'Post content',
  })
  content: RawDraftContentState;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'keywords that using for SEO',
  })
  keywords: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'base 64 url',
    description: 'images',
  })
  image_bytes: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Topic id',
  })
  topic_id: number;
}
