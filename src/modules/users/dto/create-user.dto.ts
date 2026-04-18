import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali Karimov', description: "To'liq ism" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'ali_karimov', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username faqat harf, raqam, nuqta, _ va - dan iborat bo\'lishi kerak',
  })
  username: string;

  @ApiProperty({ example: '+998991112233', description: 'Telefon raqami' })
  @Matches(/^\+998\d{9}$/, { message: 'Telefon +998XXXXXXXXX formatida bo\'lishi kerak' })
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'Parol (min 6 belgi)' })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '123456789', description: 'Telegram ID' })
  @IsOptional()
  @IsString()
  telegramId?: string;
}
