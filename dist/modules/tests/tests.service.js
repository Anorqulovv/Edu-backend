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
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const test_entity_1 = require("../../databases/entities/test.entity");
const test_result_entity_1 = require("../../databases/entities/test-result.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const role_enum_1 = require("../../common/enums/role.enum");
let TestsService = class TestsService {
    testRepo;
    resultRepo;
    studentRepo;
    parentRepo;
    telegramService;
    constructor(testRepo, resultRepo, studentRepo, parentRepo, telegramService) {
        this.testRepo = testRepo;
        this.resultRepo = resultRepo;
        this.studentRepo = studentRepo;
        this.parentRepo = parentRepo;
        this.telegramService = telegramService;
    }
    async create(dto, currentUser) {
        if (currentUser?.role === role_enum_1.UserRole.TEACHER) {
            if (dto.groupId) {
                const teacherGroup = await this.testRepo.manager
                    .getRepository('groups')
                    .findOne({ where: { id: dto.groupId, teacherId: currentUser.id } });
                if (!teacherGroup) {
                    throw new common_1.ForbiddenException("Siz faqat o'z guruhlaringizga test yarata olasiz");
                }
            }
            if (dto.directionId) {
                throw new common_1.ForbiddenException("Ustoz yo'nalish bo'yicha test yarata olmaydi. Faqat guruh yoki umumiy test yarating");
            }
        }
        const test = this.testRepo.create(dto);
        const saved = await this.testRepo.save(test);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll(currentUser) {
        if (currentUser.role === role_enum_1.UserRole.STUDENT) {
            const student = await this.studentRepo.findOne({
                where: { userId: currentUser.id },
                relations: ['group'],
            });
            if (!student)
                return (0, succes_res_1.succesRes)([]);
            const conditions = [];
            if (student.groupId)
                conditions.push({ groupId: student.groupId });
            if (student.group?.directionId) {
                conditions.push({ directionId: student.group.directionId, groupId: null });
            }
            conditions.push({ groupId: null, directionId: null });
            const data = await this.testRepo.find({
                where: conditions,
                order: { id: 'DESC' },
                relations: ['direction', 'group'],
            });
            return (0, succes_res_1.succesRes)(data);
        }
        if ([role_enum_1.UserRole.TEACHER, role_enum_1.UserRole.SUPPORT].includes(currentUser.role)) {
            const teacherGroups = await this.testRepo.manager
                .getRepository('groups')
                .find({
                where: { teacherId: currentUser.id },
                select: ['id', 'directionId'],
            });
            const groupIds = teacherGroups.map((g) => g.id);
            const directionIds = teacherGroups.map((g) => g.directionId).filter(Boolean);
            const conditions = [];
            if (groupIds.length)
                conditions.push({ groupId: (0, typeorm_2.In)(groupIds) });
            if (directionIds.length) {
                conditions.push({ directionId: (0, typeorm_2.In)(directionIds), groupId: null });
            }
            conditions.push({ directionId: null, groupId: null });
            const data = await this.testRepo.find({
                where: conditions,
                order: { id: 'DESC' },
                relations: ['direction', 'group'],
            });
            return (0, succes_res_1.succesRes)(data);
        }
        const data = await this.testRepo.find({
            order: { id: 'DESC' },
            relations: ['direction', 'group'],
        });
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id, currentUser) {
        const test = await this.testRepo.findOne({
            where: { id },
            relations: {
                questions: { choices: true },
                results: { student: { user: true } },
                direction: true,
                group: true,
            },
            order: { questions: { id: 'ASC' } },
        });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        if (currentUser?.role === role_enum_1.UserRole.STUDENT) {
            const student = await this.studentRepo.findOne({
                where: { userId: currentUser.id },
                relations: ['group'],
            });
            if (!student)
                throw new common_1.NotFoundException("O'quvchi topilmadi");
            const isOwnGroupTest = student.groupId != null && test.groupId === student.groupId;
            const isDirectionTest = test.directionId != null &&
                test.groupId == null &&
                student.group?.directionId === test.directionId;
            const isGeneral = test.groupId == null && test.directionId == null;
            if (!isOwnGroupTest && !isDirectionTest && !isGeneral) {
                throw new common_1.ForbiddenException("Bu test sizning guruhingizga tegishli emas");
            }
            const myResults = test.results?.filter(r => r.studentId === student.id) ?? [];
            return (0, succes_res_1.succesRes)({ ...test, results: myResults });
        }
        return (0, succes_res_1.succesRes)(test);
    }
    async update(id, dto) {
        const test = await this.testRepo.findOne({ where: { id } });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        await this.testRepo.update(id, dto);
        const updated = await this.testRepo.findOne({
            where: { id },
            relations: ['direction', 'group'],
        });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const test = await this.testRepo.findOne({ where: { id } });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        await this.testRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: "Test muvaffaqiyatli o'chirildi" });
    }
    async resetTestAttempt(teacherUserId, studentId, testId) {
        const student = await this.studentRepo.findOne({
            where: { id: studentId },
            relations: ['group'],
        });
        if (!student)
            throw new common_1.NotFoundException("O'quvchi topilmadi");
        if (student.groupId) {
            const teacherGroup = await this.testRepo.manager
                .getRepository('groups')
                .findOne({ where: { id: student.groupId, teacherId: teacherUserId } });
            if (!teacherGroup) {
                throw new common_1.ForbiddenException("Siz faqat o'z guruhingiz o'quvchilariga ruxsat bera olasiz");
            }
        }
        const currentResult = await this.resultRepo.findOne({
            where: { testId, studentId, isCurrent: true },
        });
        if (!currentResult) {
            throw new common_1.NotFoundException("Bu o'quvchining bu test bo'yicha faol natijasi topilmadi");
        }
        const attemptCount = await this.resultRepo.count({ where: { testId, studentId } });
        await this.resultRepo.update(currentResult.id, { isCurrent: false });
        return (0, succes_res_1.succesRes)({
            message: `O'quvchi ID ${studentId} uchun test ID ${testId} natijasi arxivlandi. Endi ${attemptCount + 1}-urinish uchun ishlashi mumkin.`,
            archivedAttempt: attemptCount,
        });
    }
    async getStudentTestHistory(studentId) {
        const results = await this.resultRepo.find({
            where: { studentId },
            relations: ['test'],
            order: { createdAt: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(results);
    }
    async addScore(dto) {
        const test = await this.testRepo.findOne({ where: { id: dto.testId } });
        if (!test)
            throw new common_1.NotFoundException('Test topilmadi');
        const student = await this.studentRepo.findOne({
            where: { id: dto.studentId },
            relations: ['user', 'parent', 'parent.user'],
        });
        if (!student)
            throw new common_1.NotFoundException("O'quvchi topilmadi");
        const existing = await this.resultRepo.findOne({
            where: { testId: dto.testId, studentId: dto.studentId, isCurrent: true },
        });
        const attemptCount = await this.resultRepo.count({ where: { testId: dto.testId, studentId: dto.studentId } });
        if (existing) {
            await this.resultRepo.update(existing.id, { isCurrent: false });
        }
        const result = this.resultRepo.create({
            testId: dto.testId,
            studentId: dto.studentId,
            score: dto.score,
            attempt: attemptCount + 1,
            isCurrent: true,
        });
        const savedResult = await this.resultRepo.save(result);
        const minScore = test.minScore ?? 60;
        const passed = dto.score >= minScore;
        if (student.user?.telegramId) {
            const msg = `📊 <b>Test natijasi</b>\n\n` +
                `📝 Test: <b>${test.title}</b>\n` +
                `🎯 Ballingiz: <b>${dto.score}</b>/100\n` +
                `📉 Min ball: ${minScore}\n` +
                `${passed ? "✅ O'tdingiz!" : "❌ O'tmadingiz"}`;
            await this.telegramService.sendNotification(student.user.telegramId, msg);
        }
        if (!passed && student.parent?.user?.telegramId) {
            const parentMsg = `⚠️ <b>Hurmatli ota-ona!</b>\n\n` +
                `👤 O'quvchi: <b>${student.user?.fullName}</b>\n` +
                `📝 Test: <b>${test.title}</b>\n` +
                `❌ Ball: <b>${dto.score}</b>/100 (min: ${minScore})\n\n` +
                `Iltimos, farzandingiz bilan suhbatlashib ko'ring.`;
            await this.telegramService.sendNotification(student.parent.user.telegramId, parentMsg);
        }
        return (0, succes_res_1.succesRes)(savedResult);
    }
    async submitTest(userId, testId, answers) {
        const student = await this.studentRepo.findOne({
            where: { userId },
            relations: ['user', 'parent', 'parent.user', 'group'],
        });
        if (!student)
            throw new common_1.NotFoundException("O'quvchi topilmadi");
        const test = await this.testRepo.findOne({
            where: { id: testId },
            relations: { questions: { choices: true } },
        });
        if (!test)
            throw new common_1.NotFoundException('Test topilmadi');
        const existingResult = await this.resultRepo.findOne({
            where: { testId, studentId: student.id, isCurrent: true },
        });
        if (existingResult) {
            throw new common_1.ForbiddenException("Siz bu testni allaqachon ishlagansiz. Qayta ishlash uchun ustoz ruxsati kerak.");
        }
        const isOwnGroupTest = student.groupId != null && test.groupId === student.groupId;
        const isDirectionTest = test.directionId != null &&
            test.groupId == null &&
            student.group?.directionId === test.directionId;
        const isGeneral = test.groupId == null && test.directionId == null;
        if (!isOwnGroupTest && !isDirectionTest && !isGeneral) {
            throw new common_1.ForbiddenException("Bu test sizning guruhingizga tegishli emas");
        }
        let correctCount = 0;
        const totalQuestions = test.questions.length;
        for (const question of test.questions) {
            const selectedChoiceId = answers[question.id];
            if (!selectedChoiceId)
                continue;
            const correctChoice = question.choices.find(c => c.isCorrect === true);
            if (correctChoice && correctChoice.id === selectedChoiceId) {
                correctCount++;
            }
        }
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const minScore = test.minScore ?? 60;
        const passed = score >= minScore;
        const previousAttempts = await this.resultRepo.count({ where: { testId, studentId: student.id } });
        const result = this.resultRepo.create({
            testId,
            studentId: student.id,
            score,
            attempt: previousAttempts + 1,
            isCurrent: true,
        });
        await this.resultRepo.save(result);
        if (student.user?.telegramId) {
            const msg = `🧪 <b>Test natijasi</b>\n\n` +
                `📝 Test: <b>${test.title}</b>\n` +
                `🎯 Sizning ballingiz: <b>${score}</b>/100\n` +
                `📉 Minimal ball: ${minScore}\n` +
                `🔢 Urinish: ${previousAttempts + 1}-chi\n` +
                `${passed ? "✅ Tabriklaymiz! O'tdingiz 🎉" : "❌ Afsus, o'tmadingiz"}`;
            await this.telegramService.sendNotification(student.user.telegramId, msg);
        }
        if (student.parent?.user?.telegramId) {
            const parentMsg = `⚠️ <b>Hurmatli ota-ona!</b>\n\n` +
                `👤 O'quvchi: <b>${student.user?.fullName}</b>\n` +
                `📝 Test: <b>${test.title}</b>\n` +
                `🎯 Ball: <b>${score}</b>/100 (min: ${minScore})\n` +
                `🔢 Urinish: ${previousAttempts + 1}-chi\n` +
                `${passed ? "✅ O'tdi" : "❌ O'tmadi"}\n\n` +
                `Iltimos, farzandingiz bilan natijani muhokama qiling.`;
            await this.telegramService.sendNotification(student.parent.user.telegramId, parentMsg);
        }
        return (0, succes_res_1.succesRes)({
            testId,
            studentId: student.id,
            score,
            passed,
            attempt: previousAttempts + 1,
            message: "Test muvaffaqiyatli topshirildi. Natijalar o'quvchi va ota-onaga yuborildi.",
        });
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(test_entity_1.Test)),
    __param(1, (0, typeorm_1.InjectRepository)(test_result_entity_1.TestResult)),
    __param(2, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(3, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], TestsService);
//# sourceMappingURL=tests.service.js.map