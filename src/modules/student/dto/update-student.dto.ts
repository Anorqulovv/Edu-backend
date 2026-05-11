import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber, IsOptional, IsString, Matches, MinLength, ValidateNested,
} from 'class-validator';

// Parent maydonlari — ichida nested object sifatida
export class UpdateParentInStudentDto {
  @ApiPropertyOptional({ example: 'Karim Karimov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @Matches(/^\+998\d{9}$/, { message: "Telefon +998XXXXXXXXX formatida bo'lishi kerak" })
  phone?: string;

  @ApiPropertyOptional({ example: '+998901234568', description: 'Ikkinchi telefon raqami (ixtiyoriy)' })
  @IsOptional()
  @Matches(/^\+998\d{9}$/, { message: "phone2 +998XXXXXXXXX formatida bo'lishi kerak" })
  phone2?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  telegramId?: string;

  @ApiPropertyOptional({ example: 'karim_karimov' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'Password123!' })
  @IsOptional()
  @MinLength(6)
  password?: string;
}

export class UpdateStudentDto {
  // Student-specific fields
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

  // User fields
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'ali_karimov' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @Matches(/^\+998\d{9}$/, { message: "Telefon +998XXXXXXXXX formatida bo'lishi kerak" })
  phone?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  telegramId?: string;

  // Parent fields — ixtiyoriy, nested object
  @ApiPropertyOptional({ type: UpdateParentInStudentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateParentInStudentDto)
  parent?: UpdateParentInStudentDto;
}
