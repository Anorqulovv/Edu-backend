import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'CARD456' })
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  groupId?: number;
}
