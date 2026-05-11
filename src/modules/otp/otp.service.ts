import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/databases/entities/user.entity';
import { TelegramService } from '../telegram/telegram.service';
import { succesRes } from 'src/infrastructure/utils/succes-res';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class OtpService {
  // In-memory OTP store (production-da Redis ishlatish tavsiya etiladi)
  private otpStore = new Map<string, OtpEntry>();

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly telegramService: TelegramService,
  ) {}

  // OTP yuborish (phone bo'yicha)
  async sendOtp(phone: string) {
    const normalized = this._normalizePhone(phone);

    const user = await this.userRepo.findOne({ where: { phone: normalized } });
    if (!user) throw new NotFoundException('Bu raqam tizimda topilmadi');

    if (!user.telegramId) {
      throw new BadRequestException(
        'Bu raqam Telegram botga ulanmagan. Avval botga /start yuboring va raqamingizni bog\'lang.',
      );
    }

    const code = this._generateCode();
    this.otpStore.set(normalized, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 daqiqa
      attempts: 0,
    });

    const message =
      `🔐 <b>Tasdiqlash kodi</b>\n\n` +
      `Sizning bir martalik kodingiz:\n\n` +
      `<code>${code}</code>\n\n` +
      `⏱ Kod 5 daqiqa davomida amal qiladi.\n` +
      `⚠️ Kodni hech kimga bermang!`;

    await this.telegramService.sendNotification(user.telegramId, message);

    return succesRes({ message: 'OTP Telegram orqali yuborildi', phone: normalized });
  }

  // OTP tekshirish
  async verifyOtp(phone: string, code: string) {
    const normalized = this._normalizePhone(phone);
    const entry = this.otpStore.get(normalized);

    if (!entry) throw new BadRequestException('OTP topilmadi yoki muddati o\'tgan');
    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(normalized);
      throw new BadRequestException('OTP muddati o\'tib ketdi. Qaytadan so\'rang');
    }

    entry.attempts++;
    if (entry.attempts > 3) {
      this.otpStore.delete(normalized);
      throw new BadRequestException('Ko\'p urinish. OTP o\'chirildi. Qaytadan so\'rang');
    }

    if (entry.code !== code) {
      throw new BadRequestException(`Noto'g'ri kod. ${3 - entry.attempts} ta urinish qoldi`);
    }

    this.otpStore.delete(normalized);
    return succesRes({ verified: true, message: 'OTP tasdiqlandi' });
  }

  private _generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private _normalizePhone(phone: string): string {
    let p = phone.replace(/[^\+\d]/g, '');
    if (!p.startsWith('+')) p = '+' + p;
    if (!p.startsWith('+998') && p.length === 9) p = '+998' + p;
    return p;
  }
}
