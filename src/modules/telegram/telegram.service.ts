import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup, Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from 'src/databases/entities/user.entity';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private broadcastUsers = new Map<number, boolean>(); // faqat broadcast rejimi

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.bot = new Telegraf(process.env.BOT_TOKEN || '');
  }

  onModuleInit() {
    this.setupCommands();
    console.log('🤖 Telegram Bot (minimal) ishga tushdi — faqat elon va yo‘qlama xabarlari');
    this.bot.launch()
      .then(() => console.log('✅ Telegram Bot muvaffaqiyatli ishga tushdi!'))
      .catch(err => console.error('❌ Bot xatosi:', err.message));
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    let normalized = phone.replace(/[^+\d]/g, '');
    if (normalized.startsWith('998')) normalized = '+' + normalized;
    else if (!normalized.startsWith('+998')) {
      normalized = normalized.replace(/^\+?0?998?/, '');
      normalized = '+998' + normalized;
    }
    return normalized.length === 13 && normalized.startsWith('+998') ? normalized : '';
  }

  private async getCurrentUser(telegramId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { telegramId } });
  }

  // ==================== TELEFON BILAN KIRISH ====================
  private async showWelcome(ctx: Context) {
    await ctx.reply(
      '👋 *Salom!*\n\nAkkauntingizni bog‘lash uchun telefon raqamingizni yuboring yoki kontaktni tanlang.',
      Markup.keyboard([[Markup.button.contactRequest('📲 Kontaktni yuborish')]]).resize()
    );
  }

  private async linkPhoneToUser(ctx: Context, rawPhone: string) {
    try {
      const phone = this.normalizePhone(rawPhone);
      if (!phone) return ctx.reply('❌ Noto‘g‘ri format. +998XXXXXXXXX shaklida yuboring.');

      const user = await this.userRepo.findOne({ where: { phone } });
      if (!user) return ctx.reply('❌ Bu raqam tizimda topilmadi.\nMa’muriyatga murojaat qiling.');

      user.telegramId = ctx.from!.id.toString();
      await this.userRepo.save(user);

      await ctx.reply(`✅ Bog‘landi!\n👤 ${user.fullName}\n🔑 Rol: ${user.role}`);
      await this.showMainMenu(ctx, user);
    } catch (error) {
      console.error(error);
      ctx.reply('❌ Xatolik yuz berdi.');
    }
  }

  private async showMainMenu(ctx: Context, user: User) {
    // Faqat ruxsat etilgan rollarda elon yuborish tugmasi ko‘rinadi
    const canBroadcast = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER].includes(user.role);

    const buttons = canBroadcast
      ? [['📢 E’lon yuborish']]
      : [['✅ Bog‘landim']];

    await ctx.reply(
      `👋 *Salom, ${user.fullName}!*\nXush kelibsiz!\n\n🔑 Rolingiz: *${user.role}*`,
      { parse_mode: 'Markdown', ...Markup.keyboard(buttons).resize() }
    );
  }

  private setupCommands() {
    this.bot.start(async (ctx) => await this.showWelcome(ctx));

    this.bot.on('contact', async (ctx) => {
      const phone = ctx.message!.contact!.phone_number;
      await this.linkPhoneToUser(ctx, phone);
    });

    this.bot.on('text', async (ctx) => {
      const text = ctx.message!.text!.trim();
      const userId = ctx.from!.id;
      const user = await this.getCurrentUser(ctx.from!.id.toString());

      if (!user) {
        const phoneRegex = /^(\+?998)?\s?\d{9}$/;
        if (phoneRegex.test(text.replace(/\s+/g, ''))) {
          return this.linkPhoneToUser(ctx, text);
        }
        return ctx.reply('Iltimos, telefon raqamingizni yuboring.');
      }

      // Broadcast rejimi
      if (this.broadcastUsers.get(userId)) {
        this.broadcastUsers.delete(userId);
        if (text === '/cancel') return ctx.reply('✅ E’lon bekor qilindi.');
        return this.broadcastMessage(text, user);
      }

      if (text.includes('E’lon yuborish')) {
        await this.startBroadcast(ctx, user);
      } else {
        await ctx.reply('✅ Bot faqat elon yuborish va yo‘qlama xabarlari uchun ishlaydi.');
      }
    });
  }

  private async startBroadcast(ctx: Context, user: User) {
    if (![UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER].includes(user.role)) {
      return ctx.reply('❌ Bu funksiya sizga ruxsat etilmagan.');
    }
    this.broadcastUsers.set(ctx.from!.id, true);
    await ctx.reply(
      `📢 *E’lon yuborish rejimi faollashtirildi*\n\nMatn yozing.\nBekor qilish uchun: /cancel`,
      { parse_mode: 'Markdown' }
    );
  }

  private async broadcastMessage(message: string, sender: User) {
    const users = await this.userRepo.find({
      where: { telegramId: Not(IsNull()) },
      select: ['telegramId', 'fullName'],
    });

    let success = 0, failed = 0;
    for (const u of users) {
      try {
        await this.bot.telegram.sendMessage(
          u.telegramId!,
          `📢 *Markaziy e’lon*\n\n${message}\n\n— ${sender.fullName}`,
          { parse_mode: 'Markdown' }
        );
        success++;
        await new Promise(r => setTimeout(r, 40));
      } catch {
        failed++;
      }
    }

    await this.bot.telegram.sendMessage(
      sender.telegramId!,
      `✅ E’lon yuborildi!\nYetkazildi: ${success}\nYetkazilmadi: ${failed}`,
      { parse_mode: 'Markdown' }
    );
  }

  // ==================== BOSHQA MODULLAR UCHUN XABAR YUBORISH ====================
  async sendNotification(telegramId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (e) {
      console.error('Telegram notification error:', e);
    }
  }
}