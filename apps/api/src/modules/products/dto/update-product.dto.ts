import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { UnitType } from '@prisma/client';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Whole Milk 1L' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Category ID to assign' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: UnitType, example: UnitType.UNIT })
  @IsOptional()
  @IsEnum(UnitType)
  defaultUnit?: UnitType;
}
