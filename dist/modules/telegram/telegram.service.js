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
const student_entity_1 = require("../../databases/entities/student.entity");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const test_result_entity_1 = require("../../databases/entities/test-result.entity");
const attendance_entity_1 = require("../../databases/entities/attendance.entity");
const role_enum_1 = require("../../common/enums/role.enum");
let TelegramService = class TelegramService {
    userRepo;
    studentRepo;
    parentRepo;
    resultRepo;
    attRepo;
    bot;
    broadcastWriting = new Map();
    pendingBroadcasts = new Map();
    constructor(userRepo, studentRepo, parentRepo, resultRepo, attRepo) {
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
        this.parentRepo = parentRepo;
        this.resultRepo = resultRepo;
        this.attRepo = attRepo;
        this.bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN || '');
    }
    onModuleInit() {
        this.setupCommands();
        this.bot
            .launch()
            .then(() => console.log('✅ Telegram Bot muvaffaqiyatli ishga tushdi!'))
            .catch((err) => console.error('❌ Bot xatosi:', err.message));
    }
    normalizePhone(phone) {
        if (!phone)
            return '';
        let normalized = phone.replace(/[^\+\d]/g, '');
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
    getRoleLabel(role) {
        const labels = {
            SUPERADMIN: '👑 Superadmin',
            ADMIN: '🛡 Admin',
            TEACHER: '👨‍🏫 Ustoz',
            SUPPORT: '🛠 Support',
            STUDENT: "🎓 O'quvchi",
            PARENT: '👨‍👩‍👦 Ota-ona',
        };
        return labels[role] ?? role;
    }
    canBroadcast(role) {
        return [role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.TEACHER].includes(role);
    }
    async showWelcome(ctx) {
        await ctx.reply('👋 <b>Salom!</b>\n\nAkkauntingizni bog\'lash uchun telefon raqamingizni yuboring yoki kontaktni tanlang.', {
            parse_mode: 'HTML',
            ...telegraf_1.Markup.keyboard([[telegraf_1.Markup.button.contactRequest('📲 Kontaktni yuborish')]]).resize(),
        });
    }
    async linkPhoneToUser(ctx, rawPhone) {
        try {
            const phone = this.normalizePhone(rawPhone);
            if (!phone) {
                return ctx.reply('❌ Noto\'g\'ri format. +998XXXXXXXXX shaklida yuboring.');
            }
            let user = await this.userRepo.findOne({ where: { phone } });
            if (!user) {
                const parentWithPhone2 = await this.parentRepo.findOne({
                    where: { phone2: phone },
                    relations: ['user'],
                });
                if (parentWithPhone2?.user) {
                    user = parentWithPhone2.user;
                }
            }
            if (!user) {
                return ctx.reply('❌ Bu raqam tizimda topilmadi.\nMa\'muriyatga murojaat qiling.');
            }
            user.telegramId = ctx.from.id.toString();
            await this.userRepo.save(user);
            await ctx.reply(`✅ <b>Muvaffaqiyatli bog'landi!</b>\n👤 ${user.fullName}\n${this.getRoleLabel(user.role)}`, { parse_mode: 'HTML' });
            await this.showMainMenu(ctx, user);
        }
        catch (error) {
            console.error('Link phone error:', error);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showMainMenu(ctx, user) {
        const role = user.role;
        let menuText = `👋 <b>Salom, ${user.fullName}!</b>\nXush kelibsiz!\n\n`;
        menuText += `🔑 Rolingiz: <b>${this.getRoleLabel(role)}</b>\n`;
        menuText += `─────────────────\n`;
        menuText += `<b>Sizning imkoniyatlaringiz:</b>\n`;
        let keyboard = [];
        switch (role) {
            case role_enum_1.UserRole.SUPERADMIN:
                menuText += `• 📢 Barcha foydalanuvchilarga e'lon yuborish\n`;
                menuText += `• 📊 Tizim statistikasi\n`;
                menuText += `• 👥 Barcha foydalanuvchilar boshqaruvi`;
                keyboard = [
                    ["📢 E'lon yuborish"],
                    ["📊 Statistika"],
                ];
                break;
            case role_enum_1.UserRole.ADMIN:
                menuText += `• 📢 Barcha foydalanuvchilarga e'lon yuborish\n`;
                menuText += `• 📊 Guruh statistikasi`;
                keyboard = [
                    ["📢 E'lon yuborish"],
                    ["📊 Statistika"],
                ];
                break;
            case role_enum_1.UserRole.TEACHER:
                menuText += `• 📢 O'quvchilaringizga e'lon yuborish\n`;
                menuText += `• 📊 Guruhlarim statistikasi\n`;
                menuText += `• 📅 Guruhlarim davomati`;
                keyboard = [
                    ["📢 E'lon yuborish"],
                    ["📊 Guruhlarim statistikasi", "📅 Guruhlarim davomati"],
                    ["📞 Admin bilan bog'lanish"],
                ];
                break;
            case role_enum_1.UserRole.SUPPORT:
                menuText += `• ℹ️ Siz tizimda Support sifatida ro'yxatdan o'tgansiz\n`;
                menuText += `• 📊 O'quvchilar statistikasi\n`;
                menuText += `• 📞 Admin bilan bog'lanish`;
                keyboard = [
                    ["ℹ️ Mening huquqlarim"],
                    ["📊 O'quvchilar statistikasi"],
                    ["📞 Admin bilan bog'lanish"],
                ];
                break;
            case role_enum_1.UserRole.STUDENT:
                menuText += `• 📝 Test natijalari va reytingingiz\n`;
                menuText += `• 📅 Davomat tarixi`;
                keyboard = [
                    ["📝 Mening natijalarim"],
                    ["📅 Davomatim"], ["📞 Admin bilan bog'lanish"],
                ];
                break;
            case role_enum_1.UserRole.PARENT:
                menuText += `• 👦 Farzandingizning test natijalari\n`;
                menuText += `• 📊 Umumiy statistika\n`;
                menuText += `• 📅 Davomat holati`;
                keyboard = [
                    ["👦 Farzandlarim natijalari"],
                    ["📊 Statistika", "📅 Davomat"],
                    ["📞 Admin bilan bog'lanish"],
                ];
                break;
            default:
                menuText += `• ✅ Akkauntingiz tizimga bog'langan`;
                keyboard = [["✅ Bog'landim"]];
        }
        await ctx.reply(menuText, {
            parse_mode: 'HTML',
            ...telegraf_1.Markup.keyboard(keyboard).resize(),
        });
    }
    async showChildrenResults(ctx, user) {
        try {
            const parent = await this.parentRepo.findOne({
                where: { userId: user.id },
                relations: [
                    'students', 'students.user', 'students.group',
                    'students.results', 'students.results.test',
                ],
            });
            if (!parent || !parent.students || parent.students.length === 0) {
                return ctx.reply('❌ Sizga biriktirilgan o\'quvchi topilmadi.\nMa\'muriyatga murojaat qiling.');
            }
            for (const student of parent.students) {
                const results = (student.results ?? []).sort((a, b) => b.id - a.id);
                const totalTests = results.length;
                const avgScore = totalTests > 0
                    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests)
                    : 0;
                const passedCount = results.filter(r => r.score >= (r.test?.minScore ?? 60)).length;
                let msg = `👦 <b>${student.user?.fullName ?? 'Noma\'lum'}</b>\n`;
                msg += `📚 Guruh: <b>${student.group?.name ?? 'Biriktirilmagan'}</b>\n`;
                msg += `─────────────────\n`;
                msg += `📝 Jami testlar: <b>${totalTests} ta</b>\n`;
                if (totalTests > 0) {
                    msg += `✅ O'tgan: <b>${passedCount} ta</b>  ❌ O'tmagan: <b>${totalTests - passedCount} ta</b>\n`;
                    msg += `📈 O'rtacha ball: <b>${avgScore}/100</b>\n`;
                    msg += `─────────────────\n`;
                    msg += `<b>Oxirgi 5 ta natija:</b>\n\n`;
                    for (const r of results.slice(0, 5)) {
                        const isPassed = r.score >= (r.test?.minScore ?? 60);
                        msg += `${isPassed ? '✅' : '❌'} <b>${r.test?.title ?? 'Test'}</b>\n`;
                        msg += `   🎯 Ball: <b>${r.score}/100</b>  (min: ${r.test?.minScore ?? 60})\n\n`;
                    }
                }
                else {
                    msg += `\nℹ️ Hali hech qanday test ishlanmagan.`;
                }
                await ctx.reply(msg, { parse_mode: 'HTML' });
            }
        }
        catch (e) {
            console.error('showChildrenResults error:', e);
            ctx.reply('❌ Ma\'lumot olishda xatolik yuz berdi.');
        }
    }
    async showStudentResults(ctx, user) {
        try {
            const student = await this.studentRepo.findOne({
                where: { userId: user.id },
                relations: ['results', 'results.test', 'group'],
            });
            if (!student) {
                return ctx.reply('❌ O\'quvchi ma\'lumoti topilmadi.\nMa\'muriyatga murojaat qiling.');
            }
            const results = (student.results ?? []).sort((a, b) => b.id - a.id);
            const totalTests = results.length;
            if (totalTests === 0) {
                return ctx.reply('📝 Siz hali hech qanday test ishlamadingiz.');
            }
            const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests);
            const passedCount = results.filter(r => r.score >= (r.test?.minScore ?? 60)).length;
            let msg = `📝 <b>${user.fullName} — Test natijalari</b>\n`;
            msg += `📚 Guruh: <b>${student.group?.name ?? 'Biriktirilmagan'}</b>\n`;
            msg += `─────────────────\n`;
            msg += `📊 Jami: <b>${totalTests} ta</b>  ✅ O'tgan: <b>${passedCount}</b>  ❌ O'tmagan: <b>${totalTests - passedCount}</b>\n`;
            msg += `📈 O'rtacha ball: <b>${avgScore}/100</b>\n`;
            msg += `─────────────────\n<b>Oxirgi 5 ta natija:</b>\n\n`;
            for (const r of results.slice(0, 5)) {
                const isPassed = r.score >= (r.test?.minScore ?? 60);
                msg += `${isPassed ? '✅' : '❌'} <b>${r.test?.title ?? 'Test'}</b>\n`;
                msg += `   🎯 Ball: <b>${r.score}/100</b>\n\n`;
            }
            await ctx.reply(msg, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('showStudentResults error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showStudentAttendance(ctx, user) {
        try {
            const student = await this.studentRepo.findOne({ where: { userId: user.id } });
            if (!student) {
                return ctx.reply('❌ O\'quvchi topilmadi.');
            }
            const records = await this.attRepo.find({
                where: { studentId: student.id },
                order: { timestamp: 'DESC' },
                take: 30,
            });
            const totalDays = records.length;
            const presentDays = records.filter(r => r.isPresent).length;
            const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            const filledBlocks = Math.round(rate / 10);
            const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);
            let msg = `📅 <b>${user.fullName} — Davomat</b>\n`;
            msg += `─────────────────\n`;
            msg += `📊 Jami: <b>${totalDays}</b>  ✅ Keldi: <b>${presentDays}</b>  ❌ Kelmadi: <b>${totalDays - presentDays}</b>\n`;
            msg += `🎯 Davomat: <b>${rate}%</b>\n${progressBar}\n\n`;
            if (records.length > 0) {
                msg += `📋 <b>Oxirgi 10 ta yozuv:</b>\n`;
                records.slice(0, 10).forEach(r => {
                    const d = new Date(r.timestamp);
                    const dateStr = d.toLocaleDateString('uz-UZ');
                    const timeStr = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                    msg += `${r.isPresent ? '✅' : '❌'} ${dateStr} ${timeStr}\n`;
                });
            }
            await ctx.reply(msg, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('showStudentAttendance error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showChildrenStats(ctx, user) {
        try {
            const parent = await this.parentRepo.findOne({
                where: { userId: user.id },
                relations: ['students', 'students.user', 'students.results', 'students.results.test'],
            });
            if (!parent || !parent.students || parent.students.length === 0) {
                return ctx.reply('❌ Sizga biriktirilgan o\'quvchi topilmadi.');
            }
            for (const student of parent.students) {
                const results = student.results ?? [];
                const totalTests = results.length;
                if (totalTests === 0) {
                    await ctx.reply(`📊 <b>${student.user?.fullName}</b>\n\nHali test ishlanmagan.`, { parse_mode: 'HTML' });
                    continue;
                }
                const scores = results.map(r => r.score);
                const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                const maxScore = Math.max(...scores);
                const minScoreVal = Math.min(...scores);
                const passedCount = results.filter(r => r.score >= (r.test?.minScore ?? 60)).length;
                const passRate = Math.round((passedCount / totalTests) * 100);
                const filledBlocks = Math.round(passRate / 10);
                const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);
                let msg = `📊 <b>${student.user?.fullName} — Statistika</b>\n─────────────────\n`;
                msg += `📝 Jami testlar: <b>${totalTests}</b>\n`;
                msg += `✅ O'tgan: <b>${passedCount}</b>  |  ❌ O'tmagan: <b>${totalTests - passedCount}</b>\n\n`;
                msg += `📈 O'rtacha ball: <b>${avgScore}/100</b>\n`;
                msg += `🏆 Eng yuqori: <b>${maxScore}/100</b>\n`;
                msg += `📉 Eng past: <b>${minScoreVal}/100</b>\n\n`;
                msg += `🎯 O'tish foizi: <b>${passRate}%</b>\n${progressBar}`;
                await ctx.reply(msg, { parse_mode: 'HTML' });
            }
        }
        catch (e) {
            console.error('showChildrenStats error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showChildrenAttendance(ctx, user) {
        try {
            const parent = await this.parentRepo.findOne({
                where: { userId: user.id },
                relations: ['students', 'students.user', 'students.group'],
            });
            if (!parent || !parent.students || parent.students.length === 0) {
                return ctx.reply('❌ Sizga biriktirilgan o\'quvchi topilmadi.');
            }
            for (const student of parent.students) {
                const records = await this.attRepo.find({
                    where: { studentId: student.id },
                    order: { timestamp: 'DESC' },
                    take: 30,
                });
                const totalDays = records.length;
                const presentDays = records.filter(r => r.isPresent).length;
                const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                const filledBlocks = Math.round(rate / 10);
                const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);
                let msg = `📅 <b>${student.user?.fullName} — Davomat</b>\n`;
                msg += `📚 Guruh: <b>${student.group?.name ?? 'Biriktirilmagan'}</b>\n─────────────────\n`;
                msg += `📊 Jami: <b>${totalDays}</b>  ✅ Keldi: <b>${presentDays}</b>  ❌ Kelmadi: <b>${totalDays - presentDays}</b>\n`;
                msg += `🎯 Davomat foizi: <b>${rate}%</b>\n${progressBar}\n\n`;
                if (records.length > 0) {
                    msg += `📋 <b>Oxirgi 10 ta yozuv:</b>\n`;
                    records.slice(0, 10).forEach(r => {
                        const d = new Date(r.timestamp);
                        const dateStr = d.toLocaleDateString('uz-UZ');
                        const timeStr = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                        msg += `${r.isPresent ? '✅' : '❌'} ${dateStr} ${timeStr} (${r.type === 'TURNSTILE' ? 'Karta' : "Qo'lda"})\n`;
                    });
                }
                else {
                    msg += `ℹ️ Hali davomat yozilmagan.`;
                }
                await ctx.reply(msg, { parse_mode: 'HTML' });
            }
        }
        catch (e) {
            console.error('showChildrenAttendance error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showSupportRights(ctx, user) {
        const msg = `🛠 <b>Support — Sizning huquqlaringiz</b>\n─────────────────\n` +
            `✅ O'quvchilar ma'lumotlarini ko'rish\n` +
            `✅ Guruhlar ro'yxatini ko'rish\n` +
            `✅ Davomat ma'lumotlarini ko'rish\n` +
            `❌ E'lon yuborish (ruxsat yo'q)\n` +
            `❌ Foydalanuvchi qo'shish/o'chirish\n\n` +
            `ℹ️ Qo'shimcha huquqlar uchun admin bilan bog'laning.`;
        await ctx.reply(msg, { parse_mode: 'HTML' });
    }
    async showSupportStudentStats(ctx) {
        try {
            const students = await this.studentRepo.find({
                relations: ['user', 'group', 'results'],
            });
            const total = students.length;
            const withGroup = students.filter(s => s.groupId).length;
            const withoutGroup = total - withGroup;
            let totalResults = 0;
            let totalScore = 0;
            students.forEach(s => {
                const results = s.results ?? [];
                totalResults += results.length;
                results.forEach(r => { totalScore += r.score; });
            });
            const avgScore = totalResults > 0 ? Math.round(totalScore / totalResults) : 0;
            let msg = `📊 <b>O'quvchilar statistikasi</b>\n─────────────────\n`;
            msg += `👥 Jami o'quvchilar: <b>${total} ta</b>\n`;
            msg += `📚 Guruhda: <b>${withGroup} ta</b>  |  Guruhi yo'q: <b>${withoutGroup} ta</b>\n`;
            msg += `📝 Jami test natijalari: <b>${totalResults} ta</b>\n`;
            msg += `📈 O'rtacha ball: <b>${avgScore}/100</b>`;
            await ctx.reply(msg, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('showSupportStudentStats error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showTeacherGroupStats(ctx, user) {
        try {
            const groups = await this.studentRepo.manager
                .getRepository('Group')
                .find({
                where: { teacherId: user.id },
                relations: ['students', 'students.user', 'students.results'],
            });
            if (!groups || groups.length === 0) {
                return ctx.reply('❌ Sizga biriktirilgan guruh topilmadi.');
            }
            for (const group of groups) {
                const students = group.students ?? [];
                const studentCount = students.length;
                let totalResults = 0;
                let totalScore = 0;
                let passedResults = 0;
                students.forEach((s) => {
                    const results = s.results ?? [];
                    totalResults += results.length;
                    results.forEach((r) => {
                        totalScore += r.score;
                        if (r.score >= (r.test?.minScore ?? 60))
                            passedResults++;
                    });
                });
                const avgScore = totalResults > 0 ? Math.round(totalScore / totalResults) : 0;
                const passRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;
                let msg = `📚 <b>Guruh: ${group.name}</b>\n─────────────────\n`;
                msg += `👥 O'quvchilar soni: <b>${studentCount} ta</b>\n`;
                msg += `📝 Jami test natijalari: <b>${totalResults} ta</b>\n`;
                if (totalResults > 0) {
                    msg += `📈 O'rtacha ball: <b>${avgScore}/100</b>\n`;
                    msg += `✅ O'tish foizi: <b>${passRate}%</b>`;
                }
                else {
                    msg += `ℹ️ Hali test natijalari yo'q`;
                }
                await ctx.reply(msg, { parse_mode: 'HTML' });
            }
        }
        catch (e) {
            console.error('showTeacherGroupStats error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showTeacherGroupAttendance(ctx, user) {
        try {
            const groups = await this.studentRepo.manager
                .getRepository('Group')
                .find({
                where: { teacherId: user.id },
                relations: ['students', 'students.user', 'students.attendance'],
            });
            if (!groups || groups.length === 0) {
                return ctx.reply('❌ Sizga biriktirilgan guruh topilmadi.');
            }
            for (const group of groups) {
                const students = group.students ?? [];
                let msg = `📅 <b>Guruh davomati: ${group.name}</b>\n─────────────────\n`;
                if (students.length === 0) {
                    msg += `ℹ️ Bu guruhda o'quvchi yo'q.`;
                    await ctx.reply(msg, { parse_mode: 'HTML' });
                    continue;
                }
                for (const student of students) {
                    const records = student.attendance ?? [];
                    const totalDays = records.length;
                    const presentDays = records.filter((r) => r.isPresent).length;
                    const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                    msg += `👤 <b>${student.user?.fullName ?? 'Noma\'lum'}</b>\n`;
                    msg += `   📊 Jami: ${totalDays}  ✅ ${presentDays}  ❌ ${totalDays - presentDays}  🎯 ${rate}%\n\n`;
                }
                await ctx.reply(msg, { parse_mode: 'HTML' });
            }
        }
        catch (e) {
            console.error('showTeacherGroupAttendance error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async showAdminContact(ctx) {
        try {
            const admins = await this.userRepo.find({
                where: [
                    { role: role_enum_1.UserRole.ADMIN },
                    { role: role_enum_1.UserRole.SUPERADMIN },
                ],
                select: ['fullName', 'phone', 'telegramId', 'role'],
            });
            if (!admins || admins.length === 0) {
                return ctx.reply('❌ Admin ma\'lumotlari topilmadi.');
            }
            let msg = `📞 <b>Admin aloqa ma'lumotlari</b>\n─────────────────\n`;
            for (const admin of admins) {
                const roleLabel = admin.role === role_enum_1.UserRole.SUPERADMIN ? '👑 Superadmin' : '🛡 Admin';
                msg += `${roleLabel}: <b>${admin.fullName}</b>\n`;
                msg += `📱 Tel: <code>${admin.phone}</code>\n`;
                if (admin.telegramId) {
                    msg += `💬 Telegram: @${admin.telegramId}\n`;
                }
                msg += `\n`;
            }
            await ctx.reply(msg, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('showAdminContact error:', e);
            ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async startBroadcast(ctx, user) {
        if (!this.canBroadcast(user.role)) {
            return ctx.reply('❌ Bu funksiya sizga ruxsat etilmagan.');
        }
        this.broadcastWriting.set(ctx.from.id, true);
        await ctx.reply(`📢 <b>E'lon yuborish rejimi</b>\n\nXabar matnini yozing.\nBekor qilish: /cancel`, { parse_mode: 'HTML' });
    }
    async askConfirmBroadcast(ctx, message, sender) {
        const preview = `📋 <b>Yuborish oldidan tasdiqlang</b>\n─────────────────\n\n` +
            `📢 <b>Markaziy e'lon</b>\n\n${message}\n\n— ${sender.fullName}\n\n` +
            `─────────────────\n` +
            `⚠️ Bu xabar <b>barcha</b> foydalanuvchilarga yuboriladi.`;
        const pendingKey = `${sender.id}_${Date.now()}`;
        this.pendingBroadcasts.set(pendingKey, { message, senderTelegramId: ctx.from.id.toString() });
        await ctx.reply(preview, {
            parse_mode: 'HTML',
            ...telegraf_1.Markup.inlineKeyboard([
                [
                    telegraf_1.Markup.button.callback('✅ Tasdiqlash va yuborish', `confirm_broadcast:${pendingKey}`),
                    telegraf_1.Markup.button.callback("❌ Bekor qilish", `cancel_broadcast:${pendingKey}`),
                ],
            ]),
        });
    }
    async executeBroadcast(pendingKey, ctx) {
        const pending = this.pendingBroadcasts.get(pendingKey);
        if (!pending) {
            return ctx.editMessageText('❌ E\'lon topilmadi yoki muddati o\'tgan.');
        }
        this.pendingBroadcasts.delete(pendingKey);
        const sender = await this.userRepo.findOne({ where: { telegramId: pending.senderTelegramId } });
        if (!sender)
            return;
        await ctx.editMessageText('⏳ E\'lon yuborilmoqda...');
        const users = await this.userRepo.find({
            where: { telegramId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            select: ['telegramId', 'fullName'],
        });
        let success = 0, failed = 0;
        for (const u of users) {
            try {
                await this.bot.telegram.sendMessage(u.telegramId, `📢 <b>Markaziy e'lon</b>\n\n${pending.message}\n\n— ${sender.fullName}`, { parse_mode: 'HTML' });
                success++;
                await new Promise((r) => setTimeout(r, 40));
            }
            catch {
                failed++;
            }
        }
        await ctx.editMessageText(`✅ <b>E'lon yuborildi!</b>\n📤 Yetkazildi: <b>${success}</b>\n❌ Yetkazilmadi: <b>${failed}</b>`, { parse_mode: 'HTML' });
    }
    setupCommands() {
        this.bot.start(async (ctx) => await this.showWelcome(ctx));
        this.bot.command('menu', async (ctx) => {
            const user = await this.getCurrentUser(ctx.from.id.toString());
            if (!user)
                return this.showWelcome(ctx);
            await this.showMainMenu(ctx, user);
        });
        this.bot.command('cancel', async (ctx) => {
            const userId = ctx.from.id;
            if (this.broadcastWriting.has(userId)) {
                this.broadcastWriting.delete(userId);
                return ctx.reply("✅ E'lon bekor qilindi.", telegraf_1.Markup.removeKeyboard());
            }
            const user = await this.getCurrentUser(userId.toString());
            if (user)
                await this.showMainMenu(ctx, user);
        });
        this.bot.on('contact', async (ctx) => {
            const phone = ctx.message.contact.phone_number;
            await this.linkPhoneToUser(ctx, phone);
        });
        this.bot.action(/^confirm_broadcast:(.+)$/, async (ctx) => {
            const pendingKey = ctx.match[1];
            await ctx.answerCbQuery('✅ Yuborilmoqda...');
            await this.executeBroadcast(pendingKey, ctx);
        });
        this.bot.action(/^cancel_broadcast:(.+)$/, async (ctx) => {
            const pendingKey = ctx.match[1];
            this.pendingBroadcasts.delete(pendingKey);
            await ctx.answerCbQuery("❌ Bekor qilindi");
            await ctx.editMessageText("❌ E'lon bekor qilindi.");
        });
        this.bot.on('text', async (ctx) => {
            const text = ctx.message.text.trim();
            const telegramUserId = ctx.from.id;
            const user = await this.getCurrentUser(telegramUserId.toString());
            if (!user) {
                const phoneRegex = /^(\+?998)?\s?\d{9}$/;
                if (phoneRegex.test(text.replace(/\s+/g, ''))) {
                    return this.linkPhoneToUser(ctx, text);
                }
                return ctx.reply('📲 Iltimos, telefon raqamingizni yuboring yoki tugmani bosing.', telegraf_1.Markup.keyboard([[telegraf_1.Markup.button.contactRequest('📲 Kontaktni yuborish')]]).resize());
            }
            if (this.broadcastWriting.get(telegramUserId)) {
                this.broadcastWriting.delete(telegramUserId);
                if (text === '/cancel')
                    return ctx.reply("✅ E'lon bekor qilindi.");
                return this.askConfirmBroadcast(ctx, text, user);
            }
            if (user.role === role_enum_1.UserRole.PARENT) {
                if (text.includes('Farzandlarim natijalari'))
                    return this.showChildrenResults(ctx, user);
                if (text.includes('Statistika'))
                    return this.showChildrenStats(ctx, user);
                if (text.includes('Davomat'))
                    return this.showChildrenAttendance(ctx, user);
                return ctx.reply('👇 Quyidagi tugmalardan foydalaning:', telegraf_1.Markup.keyboard([["👦 Farzandlarim natijalari"], ["📊 Statistika", "📅 Davomat"]]).resize());
            }
            if (user.role === role_enum_1.UserRole.STUDENT) {
                if (text.includes('Mening natijalarim'))
                    return this.showStudentResults(ctx, user);
                if (text.includes('Davomatim'))
                    return this.showStudentAttendance(ctx, user);
                return ctx.reply('👇 Quyidagi tugmalardan foydalaning:', telegraf_1.Markup.keyboard([["📝 Mening natijalarim"], ["📅 Davomatim"]]).resize());
            }
            if (user.role === role_enum_1.UserRole.SUPPORT) {
                if (text.includes('Mening huquqlarim'))
                    return this.showSupportRights(ctx, user);
                if (text.includes("O'quvchilar statistikasi"))
                    return this.showSupportStudentStats(ctx);
                if (text.includes("Admin bilan bog'lanish"))
                    return this.showAdminContact(ctx);
                return ctx.reply('👇 Quyidagi tugmalardan foydalaning:', telegraf_1.Markup.keyboard([["ℹ️ Mening huquqlarim"], ["📊 O'quvchilar statistikasi"], ["📞 Admin bilan bog'lanish"]]).resize());
            }
            if (user.role === role_enum_1.UserRole.TEACHER) {
                if (text.includes("E'lon yuborish"))
                    return this.startBroadcast(ctx, user);
                if (text.includes('Guruhlarim statistikasi'))
                    return this.showTeacherGroupStats(ctx, user);
                if (text.includes('Guruhlarim davomati'))
                    return this.showTeacherGroupAttendance(ctx, user);
                if (text.includes("Admin bilan bog'lanish"))
                    return this.showAdminContact(ctx);
                return ctx.reply('👇 Quyidagi tugmalardan foydalaning:', telegraf_1.Markup.keyboard([["📢 E'lon yuborish"], ["📊 Guruhlarim statistikasi", "📅 Guruhlarim davomati"], ["📞 Admin bilan bog'lanish"]]).resize());
            }
            if (this.canBroadcast(user.role)) {
                if (text.includes("E'lon yuborish"))
                    return this.startBroadcast(ctx, user);
                if (text.includes('Statistika'))
                    return ctx.reply('📊 Statistika CRM panelda mavjud.', { parse_mode: 'HTML' });
            }
            await ctx.reply("✅ Botdan foydalanish uchun /menu ni bosing.");
        });
    }
    async broadcastFromAdmin(message) {
        try {
            const users = await this.userRepo.find({
                where: { telegramId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                select: ['telegramId'],
            });
            for (const u of users) {
                try {
                    await this.bot.telegram.sendMessage(u.telegramId, `📢 <b>E'lon</b>\n\n${message}`, { parse_mode: 'HTML' });
                    await new Promise((r) => setTimeout(r, 40));
                }
                catch { }
            }
        }
        catch (e) {
            console.error('broadcastFromAdmin error:', e);
        }
    }
    async notifyAdmins(message) {
        try {
            const admins = await this.userRepo.find({
                where: [
                    { role: role_enum_1.UserRole.ADMIN, telegramId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    { role: role_enum_1.UserRole.SUPERADMIN, telegramId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                ],
                select: ['telegramId'],
            });
            for (const admin of admins) {
                if (admin.telegramId) {
                    await this.sendNotification(admin.telegramId, message);
                    await new Promise((r) => setTimeout(r, 40));
                }
            }
        }
        catch (e) {
            console.error('Admin notify error:', e);
        }
    }
    async sendNotification(telegramId, message) {
        try {
            await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
        }
        catch (e) {
            console.error('Telegram notification error:', e);
        }
    }
    async notifyAttendance(studentId, isPresent) {
        try {
            const student = await this.studentRepo.findOne({
                where: { id: studentId },
                relations: ['user', 'parent', 'parent.user'],
            });
            if (!student?.parent?.user?.telegramId)
                return;
            const msg = isPresent
                ? `✅ <b>${student.user.fullName}</b> bugun darsga keldi`
                : `⚠️ <b>${student.user.fullName}</b> bugun darsga kelmadi`;
            await this.sendNotification(student.parent.user.telegramId, msg);
        }
        catch (e) {
            console.error('notifyAttendance error:', e);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(3, (0, typeorm_1.InjectRepository)(test_result_entity_1.TestResult)),
    __param(4, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map