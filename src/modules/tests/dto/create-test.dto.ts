import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TestType } from 'src/common/enums/test.enum';

export class CreateTestDto {
  @ApiPropertyOptional({ example: 'Math test', description: 'Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'DAILY', description: 'Test type' })
  @IsEnum(TestType)
  @IsNotEmpty()
  type: TestType;

  @ApiPropertyOptional({ example: 60, description: 'Minimum score' })
  @IsNumber()
  @IsOptional()
  minScore?: number;

  @ApiPropertyOptional({ example: 1, description: "Yo'nalish ID (optional)" })
  @IsNumber()
  @IsOptional()
  directionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Guruh ID (optional)' })
  @IsNumber()
  @IsOptional()
  groupId?: number;
}
