import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CryptoService } from 'src/infrastructure/helpers/Crypto';
import { TokenService } from 'src/infrastructure/helpers/Token';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { User } from 'src/databases/entities/user.entity';
import { LoginDto } from './dto/login';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
    private readonly otpService: OtpService,
  ) {}

  // Username + Password login
  async signIn(dto: LoginDto) {
    const { username, password } = dto;

    const user = await this.userRepo.findOne({ where: { username } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Login yoki parol xato');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akkaunt faol emas. Administratorga murojaat qiling');
    }

    const isMatch = await this.crypto.comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Login yoki parol xato');
    }

    const payload = {
      id: user.id,
      role: user.role,
      username: user.username,
      isActive: user.isActive,
    };

    const token = await this.token.generateTokens(payload);
    const { password: _pw, ...safeUser } = user;

    return succesRes({ token, user: safeUser });
  }

  // Telefon + OTP orqali login
  async requestOtpLogin(phone: string) {
    return this.otpService.sendOtp(phone);
  }

  async verifyOtpLogin(phone: string, code: string) {
    await this.otpService.verifyOtp(phone, code);

    const normalized = phone.replace(/[^\+\d]/g, '');
    const user = await this.userRepo.findOne({ where: { phone: normalized.startsWith('+') ? normalized : '+' + normalized } });
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    if (!user.isActive) {
      throw new UnauthorizedException('Akkaunt faol emas');
    }

    const payload = {
      id: user.id,
      role: user.role,
      username: user.username,
      isActive: user.isActive,
    };

    const token = await this.token.generateTokens(payload);
    const { password: _pw, ...safeUser } = user;

    return succesRes({ token, user: safeUser });
  }
}
