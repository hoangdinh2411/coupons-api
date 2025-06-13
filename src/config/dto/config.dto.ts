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
  POSTGRES_URL: string;

  @IsString()
  EMAIL_ID: string;
  @IsString()
  EMAIL_PASS: string;
}
