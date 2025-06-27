import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
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
}
