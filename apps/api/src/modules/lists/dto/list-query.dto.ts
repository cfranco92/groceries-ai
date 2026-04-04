import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ListStatus })
  @IsOptional()
  @IsEnum(ListStatus)
  status?: ListStatus;
}
