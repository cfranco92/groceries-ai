import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
