import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search products by name (case-insensitive)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['name', 'lastPurchasedAt', 'purchaseCount'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'lastPurchasedAt', 'purchaseCount'])
  sortBy?: 'name' | 'lastPurchasedAt' | 'purchaseCount' = 'name';
}
