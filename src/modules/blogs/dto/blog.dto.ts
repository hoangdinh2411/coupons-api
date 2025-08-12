import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'blog-a-b-c',
    description: 'slug',
  })
  slug: string;

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
}
