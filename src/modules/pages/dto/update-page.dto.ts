import { PartialType } from '@nestjs/mapped-types';
import { CreatePageDto } from './create-page.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'slug',
    description: 'slug',
  })
  slug: string;
}
