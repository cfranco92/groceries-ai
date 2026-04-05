import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadReceiptDto {
  @ApiPropertyOptional({
    description: 'Purchase date in ISO format',
    example: '2026-04-03',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Name of the merchant/store',
    example: 'Supermarket XYZ',
  })
  @IsOptional()
  @IsString()
  merchantName?: string;
}
