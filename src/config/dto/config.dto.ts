import { IsString, IsOptional, Matches } from 'class-validator';

export class DatabaseConfig {
  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'DB_PORT must be a number' })
  API_PORT?: number;

  @IsString()
  @IsOptional()
  NODE_ENV?: string;

  @IsString()
  JWT_SECRET?: string;

  @IsString()
  POSTGRES_HOST: string;

  @Matches(/^[0-9]+$/, { message: 'POSTGRES_PORT must be a number' })
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_USERNAME: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DATABASE: string;
}
