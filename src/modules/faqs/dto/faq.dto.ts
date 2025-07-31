import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FAQDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'question',
    description: 'question faq',
  })
  question: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: () => 'string',
    default: 'answer',
    description: 'answer faq',
  })
  answer: string;
}
