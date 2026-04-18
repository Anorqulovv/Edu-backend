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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const BaseService_1 = require("../../infrastructure/utils/BaseService");
const attendance_entity_1 = require("../../databases/entities/attendance.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const telegram_service_1 = require("../telegram/telegram.service");
let AttendanceService = class AttendanceService extends BaseService_1.BaseService {
    attRepo;
    studentRepo;
    telegramService;
    constructor(attRepo, studentRepo, telegramService) {
        super(attRepo);
        this.attRepo = attRepo;
        this.studentRepo = studentRepo;
        this.telegramService = telegramService;
    }
    async handleTurnstile(cardId) {
        const student = await this.studentRepo.findOne({
            where: { cardId },
            relations: ['user', 'parent', 'parent.user']
        });
        if (!student)
            throw new common_1.NotFoundException('Karta egasi topilmadi');
        const attendance = this.attRepo.create({
            studentId: student.id,
            isPresent: true,
            type: 'TURNSTILE',
            timestamp: new Date()
        });
        await this.attRepo.save(attendance);
        const parentTelegramId = student.parent?.user?.telegramId;
        if (parentTelegramId) {
            const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            const message = `🔔 <b>Davomat xabarnomasi</b>\n\n` +
                `Farzandingiz <b>${student.user.fullName}</b> markazga keldi.\n` +
                `🕒 Vaqt: <b>${time}</b>`;
            await this.telegramService.sendNotification(parentTelegramId, message);
        }
        return { success: true, student: student.user.fullName };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map