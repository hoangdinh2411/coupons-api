import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

export class CategoryDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'category_1',
    description: 'Name of category',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'about',
    description: 'About of category',
  })
  about: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'description',
    description: 'description of category',
  })
  description: string;

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
