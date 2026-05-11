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
const attendance_entity_1 = require("../../databases/entities/attendance.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const role_enum_1 = require("../../common/enums/role.enum");
let AttendanceService = class AttendanceService {
    attRepo;
    studentRepo;
    groupRepo;
    telegramService;
    constructor(attRepo, studentRepo, groupRepo, telegramService) {
        this.attRepo = attRepo;
        this.studentRepo = studentRepo;
        this.groupRepo = groupRepo;
        this.telegramService = telegramService;
    }
    async handleTurnstile(cardId) {
        const student = await this.studentRepo.findOne({
            where: { cardId },
            relations: ['user', 'parent', 'parent.user'],
        });
        if (!student)
            throw new common_1.NotFoundException('Karta egasi topilmadi');
        const attendance = this.attRepo.create({
            studentId: student.id,
            isPresent: true,
            type: 'TURNSTILE',
            timestamp: new Date(),
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
        return (0, succes_res_1.succesRes)({ message: 'Davomat saqlandi', student: student.user.fullName });
    }
    async createByTeacher(dto, reqUser) {
        const student = await this.studentRepo.findOne({
            where: { id: dto.studentId },
            relations: ['user', 'parent', 'parent.user', 'group'],
        });
        if (!student)
            throw new common_1.NotFoundException(`O'quvchi ID ${dto.studentId} topilmadi`);
        if (reqUser.role === role_enum_1.UserRole.TEACHER) {
            const group = await this.groupRepo.findOne({
                where: { id: student.groupId, teacherId: reqUser.id },
            });
            if (!group) {
                throw new common_1.ForbiddenException("Siz faqat o'z guruhingiz o'quvchilari uchun davomat qila olasiz");
            }
        }
        const attendance = this.attRepo.create({
            studentId: dto.studentId,
            isPresent: dto.isPresent ?? true,
            type: dto.type ?? 'MANUAL',
            timestamp: new Date(),
        });
        await this.attRepo.save(attendance);
        await this._notifyParent(student, dto.isPresent ?? true);
        return (0, succes_res_1.succesRes)({ message: 'Davomat saqlandi', attendance });
    }
    async markGroupAttendance(groupId, attendances, reqUser) {
        const group = await this.groupRepo.findOne({
            where: { id: groupId },
            relations: ['students', 'students.user', 'students.parent', 'students.parent.user'],
        });
        if (!group)
            throw new common_1.NotFoundException(`Guruh ID ${groupId} topilmadi`);
        if (reqUser.role === role_enum_1.UserRole.TEACHER && group.teacherId !== reqUser.id) {
            throw new common_1.ForbiddenException("Siz faqat o'z guruhingiz yo'qlamasini qila olasiz");
        }
        const results = [];
        for (const item of attendances) {
            const student = group.students?.find((s) => s.id === item.studentId);
            if (!student)
                continue;
            const att = this.attRepo.create({
                studentId: item.studentId,
                isPresent: item.isPresent,
                type: 'MANUAL',
                timestamp: new Date(),
            });
            await this.attRepo.save(att);
            results.push(att);
            await this._notifyParent(student, item.isPresent);
        }
        return (0, succes_res_1.succesRes)({
            message: `${results.length} ta o'quvchi yo'qlamasi saqlandi`,
            group: group.name,
            attendances: results,
        });
    }
    async getGroupAttendance(groupId, reqUser) {
        const group = await this.groupRepo.findOne({ where: { id: groupId } });
        if (!group)
            throw new common_1.NotFoundException(`Guruh topilmadi`);
        if (reqUser.role === role_enum_1.UserRole.TEACHER && group.teacherId !== reqUser.id) {
            throw new common_1.ForbiddenException("Siz faqat o'z guruhingiz davomatini ko'ra olasiz");
        }
        const students = await this.studentRepo.find({
            where: { groupId },
            relations: ['user'],
        });
        const result = await Promise.all(students.map(async (s) => {
            const records = await this.attRepo.find({
                where: { studentId: s.id },
                order: { timestamp: 'DESC' },
                take: 30,
            });
            return {
                studentId: s.id,
                fullName: s.user?.fullName,
                attendance: records,
            };
        }));
        return (0, succes_res_1.succesRes)(result);
    }
    async findAll() {
        const data = await this.attRepo.find({
            relations: ['student', 'student.user'],
            order: { timestamp: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(data);
    }
    async findByStudentUserId(userId) {
        const student = await this.studentRepo.findOne({ where: { userId } });
        if (!student)
            throw new common_1.NotFoundException('Talaba topilmadi');
        const data = await this.attRepo.find({
            where: { studentId: student.id },
            order: { timestamp: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id) {
        const att = await this.attRepo.findOne({
            where: { id },
            relations: ['student', 'student.user'],
        });
        if (!att)
            throw new common_1.NotFoundException(`Davomat ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(att);
    }
    async _notifyParent(student, isPresent) {
        try {
            const parentTelegramId = student.parent?.user?.telegramId;
            if (!parentTelegramId)
                return;
            const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            const name = student.user?.fullName ?? 'O\'quvchi';
            const message = isPresent
                ? `✅ <b>Davomat xabarnomasi</b>\n\nFarzandingiz <b>${name}</b> bugun darsga <b>keldi</b>.\n🕒 Vaqt: <b>${time}</b>`
                : `⚠️ <b>Davomat xabarnomasi</b>\n\nFarzandingiz <b>${name}</b> bugun darsga <b>kelmadi</b>.\n🕒 Vaqt: <b>${time}</b>`;
            await this.telegramService.sendNotification(parentTelegramId, message);
        }
        catch (e) {
            console.error('_notifyParent error:', e);
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map