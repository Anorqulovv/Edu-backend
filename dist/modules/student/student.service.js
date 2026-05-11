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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../../databases/entities/student.entity");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const user_entity_1 = require("../../databases/entities/user.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
const telegram_service_1 = require("../telegram/telegram.service");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let StudentsService = class StudentsService {
    studentRepo;
    groupRepo;
    parentRepo;
    userRepo;
    usersService;
    telegramService;
    constructor(studentRepo, groupRepo, parentRepo, userRepo, usersService, telegramService) {
        this.studentRepo = studentRepo;
        this.groupRepo = groupRepo;
        this.parentRepo = parentRepo;
        this.userRepo = userRepo;
        this.usersService = usersService;
        this.telegramService = telegramService;
    }
    async createWithUser(userDto, studentExtra, parentDto) {
        const userResult = await this.usersService.createUser(userDto, role_enum_1.UserRole.STUDENT);
        const newUser = userResult.data;
        const student = this.studentRepo.create({ userId: newUser.id, ...studentExtra });
        const saved = await this.studentRepo.save(student);
        let savedParent = null;
        if (parentDto?.fullName && parentDto?.phone) {
            const parentUserResult = await this.usersService.createUser({
                fullName: parentDto.fullName,
                phone: parentDto.phone,
                username: parentDto.username || `parent_${Date.now()}`,
                password: parentDto.password || `Parent@${Math.random().toString(36).slice(2, 8)}`,
                telegramId: parentDto.telegramId,
            }, role_enum_1.UserRole.PARENT);
            const newParentUser = parentUserResult.data;
            const newParent = this.parentRepo.create({
                userId: newParentUser.id,
                phone2: parentDto.phone2 || undefined,
            });
            savedParent = await this.parentRepo.save(newParent);
            await this.studentRepo.update(saved.id, { parentId: savedParent.id });
        }
        await this.telegramService.notifyAdmins(`🎓 <b>Yangi o'quvchi qo'shildi!</b>\n\n👤 <b>Ism:</b> ${newUser.fullName}\n📞 <b>Tel:</b> ${newUser.phone}\n🆔 <b>ID:</b> ${newUser.id}${savedParent ? '\n👨‍👩‍👦 Ota-ona biriktirildi' : ''}`);
        return (0, succes_res_1.succesRes)({ user: newUser, student: saved, parent: savedParent }, 201);
    }
    async create(dto) {
        const user = await this.usersService.getRepository.findOneBy({ id: dto.userId });
        if (!user || user.role !== role_enum_1.UserRole.STUDENT) {
            throw new common_1.NotFoundException('STUDENT roli bilan user topilmadi');
        }
        const exists = await this.studentRepo.findOneBy({ userId: dto.userId });
        if (exists)
            throw new common_1.NotFoundException('Bu user uchun student profil allaqachon mavjud');
        if (dto.groupId) {
            const group = await this.groupRepo.findOneBy({ id: dto.groupId });
            if (!group)
                throw new common_1.NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
        }
        const student = this.studentRepo.create({
            ...dto,
            cardId: dto.cardId?.trim() || undefined,
        });
        const saved = await this.studentRepo.save(student);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll(currentUser) {
        let students;
        if ([role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN].includes(currentUser.role)) {
            students = await this.studentRepo.find({
                relations: ['user', 'parent', 'group', 'group.teacher'],
                order: { createdAt: 'DESC' },
            });
        }
        else if (currentUser.role === role_enum_1.UserRole.SUPPORT) {
            students = await this.studentRepo.find({
                where: { group: { direction: { id: currentUser.directionId } } },
                relations: ['user', 'parent', 'group', 'group.direction'],
                order: { createdAt: 'DESC' },
            });
        }
        else {
            students = await this.studentRepo.find({
                where: { group: { teacherId: currentUser.id } },
                relations: ['user', 'parent', 'group'],
                order: { createdAt: 'DESC' },
            });
        }
        return (0, succes_res_1.succesRes)(students);
    }
    async findOne(id) {
        const student = await this.studentRepo.findOne({
            where: { id },
            relations: [
                'user',
                'parent',
                'parent.user',
                'group',
                'group.teacher',
                'group.direction',
                'attendance',
                'results',
                'results.test',
            ],
            order: { results: { id: 'DESC' } },
        });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        const results = student.results ?? [];
        const totalTests = results.length;
        const avgScore = totalTests > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests)
            : 0;
        const passedTests = results.filter((r) => r.score >= (r.test?.minScore ?? 60)).length;
        const failedTests = totalTests - passedTests;
        return (0, succes_res_1.succesRes)({
            ...student,
            stats: {
                totalTests,
                avgScore,
                passedTests,
                failedTests,
                passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
            },
        });
    }
    async update(id, dto) {
        const student = await this.studentRepo.findOne({
            where: { id },
            relations: ['user', 'parent', 'parent.user'],
        });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        if (dto.groupId) {
            const group = await this.groupRepo.findOneBy({ id: dto.groupId });
            if (!group)
                throw new common_1.NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
        }
        const { fullName, username, phone, password, telegramId, parent: parentDto, ...studentFields } = dto;
        const updateData = { ...studentFields };
        if ('cardId' in updateData) {
            updateData.cardId = updateData.cardId?.trim() || undefined;
        }
        await this.studentRepo.update(id, updateData);
        const userUpdateData = {};
        if (fullName !== undefined)
            userUpdateData.fullName = fullName;
        if (username !== undefined)
            userUpdateData.username = username;
        if (phone !== undefined)
            userUpdateData.phone = phone;
        if (password !== undefined)
            userUpdateData.password = password;
        if (telegramId !== undefined)
            userUpdateData.telegramId = telegramId;
        if (Object.keys(userUpdateData).length > 0 && student.userId) {
            await this.usersService.updateUser(student.userId, userUpdateData);
        }
        if (parentDto && Object.keys(parentDto).length > 0) {
            if (student.parentId) {
                const existingParent = await this.parentRepo.findOne({
                    where: { id: student.parentId },
                    relations: ['user'],
                });
                if (existingParent) {
                    const parentUserUpdate = {};
                    if (parentDto.fullName !== undefined)
                        parentUserUpdate.fullName = parentDto.fullName;
                    if (parentDto.phone !== undefined)
                        parentUserUpdate.phone = parentDto.phone;
                    if (parentDto.telegramId !== undefined)
                        parentUserUpdate.telegramId = parentDto.telegramId;
                    if (parentDto.username !== undefined)
                        parentUserUpdate.username = parentDto.username;
                    if (parentDto.password !== undefined)
                        parentUserUpdate.password = parentDto.password;
                    if (Object.keys(parentUserUpdate).length > 0) {
                        await this.usersService.updateUser(existingParent.userId, parentUserUpdate);
                    }
                    if (parentDto.phone2 !== undefined) {
                        await this.parentRepo.update(existingParent.id, { phone2: parentDto.phone2 });
                    }
                }
            }
            else {
                if (parentDto.fullName && parentDto.phone) {
                    const parentUser = await this.usersService.createUser({
                        fullName: parentDto.fullName,
                        phone: parentDto.phone,
                        username: parentDto.username || `parent_${Date.now()}`,
                        password: parentDto.password || `Parent@${Math.random().toString(36).slice(2, 8)}`,
                        telegramId: parentDto.telegramId,
                    }, role_enum_1.UserRole.PARENT);
                    const newParentUser = parentUser.data;
                    const newParent = this.parentRepo.create({
                        userId: newParentUser.id,
                        phone2: parentDto.phone2 || undefined,
                    });
                    const savedParent = await this.parentRepo.save(newParent);
                    await this.studentRepo.update(id, { parentId: savedParent.id });
                }
            }
        }
        const updated = await this.studentRepo.findOne({
            where: { id },
            relations: ['user', 'parent', 'parent.user', 'group'],
        });
        return (0, succes_res_1.succesRes)(updated);
    }
    async findAllWithParentIds() {
        const students = await this.studentRepo.find({
            relations: ['user', 'parent', 'parent.user', 'group'],
            order: { createdAt: 'DESC' },
        });
        const result = students.map((s) => ({
            studentId: s.id,
            studentUserId: s.userId,
            fullName: s.user?.fullName ?? '—',
            phone: s.user?.phone ?? '—',
            username: s.user?.username ?? '—',
            isActive: s.user?.isActive ?? false,
            groupName: s.group?.name ?? '—',
            groupId: s.groupId ?? null,
            cardId: s.cardId ?? null,
            parentId: s.parentId ?? null,
            parentUserId: s.parent?.userId ?? null,
            parentFullName: s.parent?.user?.fullName ?? null,
            parentPhone: s.parent?.user?.phone ?? null,
            parentTelegramId: s.parent?.user?.telegramId ?? null,
        }));
        return (0, succes_res_1.succesRes)(result);
    }
    async remove(id) {
        const student = await this.studentRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        await this.usersService.removeUser(student.userId);
        return (0, succes_res_1.succesRes)({ message: "Student va uning user akkaunt muvaffaqiyatli o'chirildi" });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(2, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        telegram_service_1.TelegramService])
], StudentsService);
//# sourceMappingURL=student.service.js.map