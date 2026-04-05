import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Type } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID!: string;

  @IsString()
  @IsOptional()
  FIREBASE_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  FIREBASE_CLIENT_EMAIL?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT?: number = 3001;

  @IsString()
  @IsOptional()
  NODE_ENV?: string = 'development';

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  @IsOptional()
  GCS_BUCKET_NAME?: string;

  @IsString()
  @IsOptional()
  GCP_PROJECT_ID?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
