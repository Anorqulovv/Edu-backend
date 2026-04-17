import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';

export class CreateGroupDto {
  @ApiPropertyOptional({ example: 'Frontend Group', description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Group status' })
  @IsEnum(GroupStatus)
  @IsNotEmpty()
  status: GroupStatus = GroupStatus.ACTIVE;

  @ApiPropertyOptional({ example: 5, description: 'Teacher ID' })
  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @ApiPropertyOptional({ example: 2, description: 'Direction ID' })
  @IsNumber()
  @IsOptional()
  directionId?: number;
}