import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateParentDto {
  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  studentId?: number;
}
