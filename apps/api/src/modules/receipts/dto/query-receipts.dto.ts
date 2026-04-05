import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReceiptStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryReceiptsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReceiptStatus })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  status?: ReceiptStatus;

  @ApiPropertyOptional({
    description: 'Filter receipts from this date (ISO)',
    example: '2026-04-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter receipts until this date (ISO)',
    example: '2026-04-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
