import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateParentDto {
  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  studentId?: number;

  @ApiPropertyOptional({ example: '+998901234568', description: 'Ikkinchi telefon raqami (ixtiyoriy)' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'phone2 +998XXXXXXXXX formatida bo\'lishi kerak' })
  phone2?: string;
}
