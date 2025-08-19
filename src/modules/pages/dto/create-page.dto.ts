import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImageDto, MetaDataDto } from 'common/constants/common.dto';
import { FAQDto } from 'modules/faqs/dto/faq.dto';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'policy',
    description: 'Type of page',
  })
  type: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    description: 'Page content HTML',
    default: '<p>Page content</p>',
  })
  content: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @ApiProperty({
    type: () => ImageDto,
    default: [],
    description: 'A list of images, max 10 ',
  })
  images: ImageDto[];

  @IsOptional()
  @Type(() => ImageDto)
  @ApiProperty({
    type: () => ImageDto,
    description: 'Thumbnail one image ',
  })
  thumbnail: ImageDto;

  @IsArray()
  @IsOptional()
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

  @Type(() => MetaDataDto)
  @IsOptional()
  @ApiProperty({
    type: () => 'object',
    default: {
      title: 'string',
      description: 'string',
      keywords: '[a,b]',
    },
    description: 'Uploaded image',
  })
  meta_data: MetaDataDto;
}
