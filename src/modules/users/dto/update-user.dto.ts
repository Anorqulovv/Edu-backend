import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'ali_karimov' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username faqat harf, raqam, nuqta, _ va - dan iborat bo\'lishi kerak',
  })
  username?: string;

  @ApiPropertyOptional({ example: '+998991112233' })
  @IsOptional()
  @Matches(/^\+998\d{9}$/, { message: 'Telefon +998XXXXXXXXX formatida bo\'lishi kerak' })
  phone?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  telegramId?: string;
}
