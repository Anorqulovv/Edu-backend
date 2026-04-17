import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateParentDto {
  @ApiPropertyOptional({ example: 1, description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ example: 10, description: 'Student ID' })
  @IsNumber()
  @IsOptional()
  studentId?: number;
}