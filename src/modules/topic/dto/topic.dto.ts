import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDto } from 'common/constants/common.dto';

export class TopicDto extends BaseDto {
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
    default: 'description',
    description: 'description of topic',
  })
  description: string;
  @IsOptional()
  updated_at: Date;
}

export class UpdateTopicDto extends BaseDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'name ',
    description: 'Name of topic',
  })
  name: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: () => 'string',
    default: 'description',
    description: 'description of topic',
  })
  description: string;
}
