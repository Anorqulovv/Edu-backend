import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'example', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Example123!', description: 'Strong password' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}