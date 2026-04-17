import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'Ali Karimov', description: 'Ism' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: 'example', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: '+998991112233', description: 'Phone number' })
  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
  phone: string;

  @ApiPropertyOptional({ example: 'Example123!', description: 'Password' })
  @MinLength(6)
  password: string;
}