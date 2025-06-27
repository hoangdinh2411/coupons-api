import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';

export class BlogDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Post title',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'content content content',
    description: 'Post content',
  })
  content: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'keywords that using for SEO',
  })
  keywords: string[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'number',
    default: 1,
    description: 'Topic id',
  })
  topic_id: number;
}
