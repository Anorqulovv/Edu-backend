import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class AddScoreDto {
  @ApiPropertyOptional({ example: 1, description: 'Test ID' })
  @IsNumber()
  @IsNotEmpty()
  testId: number;

  @ApiPropertyOptional({ example: 10, description: 'Student ID' })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiPropertyOptional({ example: 85, description: 'Score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  score: number;
}