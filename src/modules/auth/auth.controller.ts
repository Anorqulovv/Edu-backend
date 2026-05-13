import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/databases/entities/user.entity';
import { CryptoService } from 'src/infrastructure/helpers/Crypto';

class OtpRequestDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString() @IsNotEmpty()
  phone: string;
}

class OtpVerifyDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString() @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString() @IsNotEmpty()
  code: string;
}

class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsOptional() @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'ali_karimov' })
  @IsOptional() @IsString()
  username?: string;

  @ApiPropertyOptional({ example: '+998991112233' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional() @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'OldPassword123!' })
  @IsOptional() @IsString()
  oldPassword?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!' })
  @IsOptional() @IsString()
  newPassword?: string;

  @ApiPropertyOptional({ example: 'NewPassword123!' })
  @IsOptional() @IsString()
  confirmPassword?: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly crypto: CryptoService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Username + password bilan kirish' })
  async signIn(@Body() dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Telegram orqali OTP yuborish' })
  async sendOtp(@Body() dto: OtpRequestDto) {
    return this.authService.requestOtpLogin(dto.phone);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'OTP kod bilan kirish' })
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtpLogin(dto.phone, dto.code);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "O'zim haqimda — token bilan" })
  async getMe(@Req() req: any) {
    const user = await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['direction'],
    });
    if (!user) return succesRes(req.user);
    const { password: _, ...safe } = user;
    return succesRes(safe);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "O'z profilini yangilash va parolni o'zgartirish" })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['direction'],
    });

    if (!user) {
      throw new BadRequestException('Foydalanuvchi topilmadi');
    }

    const {
      oldPassword,
      newPassword,
      confirmPassword,
      ...profileData
    } = dto;

    const updateData: Partial<User> = { ...profileData };

    const wantsPasswordChange = Boolean(oldPassword || newPassword || confirmPassword);

    if (wantsPasswordChange) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        throw new BadRequestException("Parolni o'zgartirish uchun eski parol, yangi parol va tasdiqlash paroli kerak");
      }

      if (newPassword.length < 6) {
        throw new BadRequestException("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException("Yangi parol va tasdiqlash paroli mos emas");
      }

      if (!user.password) {
        throw new BadRequestException("Bu foydalanuvchida parol mavjud emas");
      }

      const isOldPasswordValid = await this.crypto.comparePassword(oldPassword, user.password);

      if (!isOldPasswordValid) {
        throw new BadRequestException("Eski parol noto'g'ri");
      }

      updateData.password = await this.crypto.hashPassword(newPassword);
    }

    await this.userRepo.update(req.user.id, updateData);

    const updated = await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['direction'],
    });

    const { password: _, ...safe } = updated!;
    return succesRes(safe);
  }
}
