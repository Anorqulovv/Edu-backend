import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Matches, MinLength, IsStrongPassword } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Sardor Adminov' })
  @IsString() @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'sardor_admin' })
  @IsString() @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Username noto\'g\'ri format' })
  username: string;

  @ApiProperty({ example: '+998901112233' })
  @Matches(/^\+998\d{9}$/, { message: 'Telefon +998XXXXXXXXX formatida bo\'lishi kerak' })
  phone: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsStrongPassword()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional() @IsString()
  telegramId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Direction ID' })
  @IsOptional() @IsNumber()
  directionId?: number;
}
