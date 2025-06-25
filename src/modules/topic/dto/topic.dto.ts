import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SeoDto } from 'common/constants/common.dto';

export class TopicDto extends SeoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'category_1',
    description: 'Name of category',
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: () => 'string',
    default: 'icon-1',
    description: 'Image with format Base64',
  })
  // @IsNotEmpty()
  image_bytes: string;
}
