import { IsNotEmpty, IsString } from 'class-validator';

export class FilesDto {
  @IsString()
  @IsNotEmpty()
  public_id: string;
}
