import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
  @ApiOperation({ summary: "O'z profilini yangilash (avatar, fullName, username, phone)" })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    await this.userRepo.update(req.user.id, dto);
    const updated = await this.userRepo.findOne({
      where: { id: req.user.id },
      relations: ['direction'],
    });
    const { password: _, ...safe } = updated!;
    return succesRes(safe);
  }
}
