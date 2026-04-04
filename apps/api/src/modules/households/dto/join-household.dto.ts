import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinHouseholdDto {
  @ApiProperty({ example: 'ABC123XY' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  inviteCode!: string;
}
