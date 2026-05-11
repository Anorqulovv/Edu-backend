"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../databases/entities/user.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let OtpService = class OtpService {
    userRepo;
    telegramService;
    otpStore = new Map();
    constructor(userRepo, telegramService) {
        this.userRepo = userRepo;
        this.telegramService = telegramService;
    }
    async sendOtp(phone) {
        const normalized = this._normalizePhone(phone);
        const user = await this.userRepo.findOne({ where: { phone: normalized } });
        if (!user)
            throw new common_1.NotFoundException('Bu raqam tizimda topilmadi');
        if (!user.telegramId) {
            throw new common_1.BadRequestException('Bu raqam Telegram botga ulanmagan. Avval botga /start yuboring va raqamingizni bog\'lang.');
        }
        const code = this._generateCode();
        this.otpStore.set(normalized, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
        });
        const message = `🔐 <b>Tasdiqlash kodi</b>\n\n` +
            `Sizning bir martalik kodingiz:\n\n` +
            `<code>${code}</code>\n\n` +
            `⏱ Kod 5 daqiqa davomida amal qiladi.\n` +
            `⚠️ Kodni hech kimga bermang!`;
        await this.telegramService.sendNotification(user.telegramId, message);
        return (0, succes_res_1.succesRes)({ message: 'OTP Telegram orqali yuborildi', phone: normalized });
    }
    async verifyOtp(phone, code) {
        const normalized = this._normalizePhone(phone);
        const entry = this.otpStore.get(normalized);
        if (!entry)
            throw new common_1.BadRequestException('OTP topilmadi yoki muddati o\'tgan');
        if (Date.now() > entry.expiresAt) {
            this.otpStore.delete(normalized);
            throw new common_1.BadRequestException('OTP muddati o\'tib ketdi. Qaytadan so\'rang');
        }
        entry.attempts++;
        if (entry.attempts > 3) {
            this.otpStore.delete(normalized);
            throw new common_1.BadRequestException('Ko\'p urinish. OTP o\'chirildi. Qaytadan so\'rang');
        }
        if (entry.code !== code) {
            throw new common_1.BadRequestException(`Noto'g'ri kod. ${3 - entry.attempts} ta urinish qoldi`);
        }
        this.otpStore.delete(normalized);
        return (0, succes_res_1.succesRes)({ verified: true, message: 'OTP tasdiqlandi' });
    }
    _generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    _normalizePhone(phone) {
        let p = phone.replace(/[^\+\d]/g, '');
        if (!p.startsWith('+'))
            p = '+' + p;
        if (!p.startsWith('+998') && p.length === 9)
            p = '+998' + p;
        return p;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        telegram_service_1.TelegramService])
], OtpService);
//# sourceMappingURL=otp.service.js.map