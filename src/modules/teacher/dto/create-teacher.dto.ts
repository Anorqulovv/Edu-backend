import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'teacher1', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: '+998991112233', description: 'Phone' })
  @Matches(/^\+998\d{9}$/)
  phone: string;

  @ApiPropertyOptional({ example: 'password123', description: 'Password' })
  @MinLength(6)
  password: string;
}