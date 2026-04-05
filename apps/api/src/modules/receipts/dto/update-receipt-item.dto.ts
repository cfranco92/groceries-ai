import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReceiptItemDto {
  @ApiPropertyOptional({
    description: 'Corrected item name',
    example: 'Organic Whole Milk 1L',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Corrected quantity',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Corrected unit price',
    example: 3.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Corrected total price',
    example: 7.98,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({
    description: 'Re-link to a different product ID',
    example: 'clxyz123abc',
  })
  @IsOptional()
  @IsString()
  productId?: string;
}
