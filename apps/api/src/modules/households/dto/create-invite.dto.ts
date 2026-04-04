import { IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiPropertyOptional({ example: 'friend@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
