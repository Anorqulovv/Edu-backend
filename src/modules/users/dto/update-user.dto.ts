import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'example' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: '+998991112233' })
  @IsOptional()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone must be in format +998XXXXXXXXX',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'Example123!' })
  @IsOptional()
  @MinLength(6)
  password?: string;
}