import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';

export class UpdateListItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @ApiPropertyOptional({ enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  unit?: UnitType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
