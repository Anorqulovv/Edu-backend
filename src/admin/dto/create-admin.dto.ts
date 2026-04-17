import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
  phone: string;

  @MinLength(6)
  password: string;
}