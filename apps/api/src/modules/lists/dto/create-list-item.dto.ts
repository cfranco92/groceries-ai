import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';

export class CreateListItemDto {
  @ApiProperty({ example: 'Whole Milk' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ default: 1, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number = 1;

  @ApiPropertyOptional({ enum: UnitType, default: UnitType.UNIT })
  @IsOptional()
  @IsEnum(UnitType)
  unit?: UnitType = UnitType.UNIT;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
