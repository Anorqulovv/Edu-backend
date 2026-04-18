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
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../databases/entities/user.entity");
const role_enum_1 = require("../../common/enums/role.enum");
let TelegramService = class TelegramService {
    userRepo;
    bot;
    broadcastUsers = new Map();
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN || '');
    }
    onModuleInit() {
        this.setupCommands();
        this.bot.launch()
            .then(() => console.log('✅ Telegram Bot muvaffaqiyatli ishga tushdi!'))
            .catch(err => console.error('❌ Bot xatosi:', err.message));
    }
    normalizePhone(phone) {
        if (!phone)
            return '';
        let normalized = phone.replace(/[^+\d]/g, '');
        if (normalized.startsWith('998'))
            normalized = '+' + normalized;
        else if (!normalized.startsWith('+998')) {
            normalized = normalized.replace(/^\+?0?998?/, '');
            normalized = '+998' + normalized;
        }
        return normalized.length === 13 && normalized.startsWith('+998') ? normalized : '';
    }
    async getCurrentUser(telegramId) {
        return this.userRepo.findOne({ where: { telegramId } });
    }
    async showWelcome(ctx) {
        await ctx.reply('👋 *Salom!*\n\nAkkauntingizni bog‘lash uchun telefon raqamingizni yuboring yoki kontaktni tanlang.', telegraf_1.Markup.keyboard([[telegraf_1.Markup.button.contactRequest('📲 Kontaktni yuborish')]]).resize());
    }
    async linkPhoneToUser(ctx, rawPhone) {
        try {
            const phone = this.normalizePhone(rawPhone);
            if (!phone)
                return ctx.reply('❌ Noto‘g‘ri format. +998XXXXXXXXX shaklida yuboring.');
            const user = await this.userRepo.findOne({ where: { phone } });
            if (!user)
                return ctx.reply('❌ Bu raqam tizimda topilmadi.\nMa’muriyatga murojaat qiling.');
            user.telegramId = ctx.from.id.toString();
            await this.userRepo.save(user);
            await ctx.reply(`✅ Bog‘landi!\n👤 ${user.fullName}\n🔑 Rol: ${user.role}`);
            await this.showMainMenu(ctx, user);
        }
        catch (error) {
            console.error(error);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showMainMenu(ctx, user) {
        const canBroadcast = [role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER].includes(user.role);
        const buttons = canBroadcast
            ? [['📢 E’lon yuborish']]
            : [['✅ Bog‘landim']];
        await ctx.reply(`👋 *Salom, ${user.fullName}!*\nXush kelibsiz!\n\n🔑 Rolingiz: *${user.role}*`, { parse_mode: 'Markdown', ...telegraf_1.Markup.keyboard(buttons).resize() });
    }
    setupCommands() {
        this.bot.start(async (ctx) => await this.showWelcome(ctx));
        this.bot.on('contact', async (ctx) => {
            const phone = ctx.message.contact.phone_number;
            await this.linkPhoneToUser(ctx, phone);
        });
        this.bot.on('text', async (ctx) => {
            const text = ctx.message.text.trim();
            const userId = ctx.from.id;
            const user = await this.getCurrentUser(ctx.from.id.toString());
            if (!user) {
                const phoneRegex = /^(\+?998)?\s?\d{9}$/;
                if (phoneRegex.test(text.replace(/\s+/g, ''))) {
                    return this.linkPhoneToUser(ctx, text);
                }
                return ctx.reply('Iltimos, telefon raqamingizni yuboring.');
            }
            if (this.broadcastUsers.get(userId)) {
                this.broadcastUsers.delete(userId);
                if (text === '/cancel')
                    return ctx.reply('✅ E’lon bekor qilindi.');
                return this.broadcastMessage(text, user);
            }
            if (text.includes('E’lon yuborish')) {
                await this.startBroadcast(ctx, user);
            }
            else {
                await ctx.reply('✅ Bot faqat elon yuborish va yo‘qlama xabarlari uchun ishlaydi.');
            }
        });
    }
    async startBroadcast(ctx, user) {
        if (![role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER].includes(user.role)) {
            return ctx.reply('❌ Bu funksiya sizga ruxsat etilmagan.');
        }
        this.broadcastUsers.set(ctx.from.id, true);
        await ctx.reply(`📢 *E’lon yuborish rejimi faollashtirildi*\n\nMatn yozing.\nBekor qilish uchun: /cancel`, { parse_mode: 'Markdown' });
    }
    async broadcastMessage(message, sender) {
        const users = await this.userRepo.find({
            where: { telegramId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            select: ['telegramId', 'fullName'],
        });
        let success = 0, failed = 0;
        for (const u of users) {
            try {
                await this.bot.telegram.sendMessage(u.telegramId, `📢 *Markaziy e’lon*\n\n${message}\n\n— ${sender.fullName}`, { parse_mode: 'Markdown' });
                success++;
                await new Promise(r => setTimeout(r, 40));
            }
            catch {
                failed++;
            }
        }
        await this.bot.telegram.sendMessage(sender.telegramId, `✅ E’lon yuborildi!\nYetkazildi: ${success}\nYetkazilmadi: ${failed}`, { parse_mode: 'Markdown' });
    }
    async sendNotification(telegramId, message) {
        try {
            await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('Telegram notification error:', e);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map