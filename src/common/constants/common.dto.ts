import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class MetaDataDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Seo title',
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'ABC123',
    description: 'Seo description',
  })
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    type: () => 'array',
    default: ['AI', 'programming'],
    description: 'keywords that using for SEO',
  })
  keywords: string[];
}

export class ImageDto {
  @IsOptional()
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  public_id: string;

  @IsString()
  @IsOptional()
  file_name: string;
}

export class BaseDto {
  @ValidateNested()
  @Type(() => ImageDto)
  @ApiProperty({
    type: () => 'object',
    default: {
      url: 'string',
      public_id: 'string',
      file_name: 'string',
    },
    description: 'Uploaded image',
  })
  image: ImageDto;

  @ValidateNested()
  @Type(() => MetaDataDto)
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
