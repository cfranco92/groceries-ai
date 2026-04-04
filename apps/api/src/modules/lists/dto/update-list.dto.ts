import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListStatus } from '@prisma/client';

export class UpdateListDto {
  @ApiPropertyOptional({ example: 'Updated List Name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ListStatus })
  @IsOptional()
  @IsEnum(ListStatus)
  status?: ListStatus;
}
