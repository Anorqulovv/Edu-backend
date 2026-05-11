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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_entity_1 = require("../../databases/entities/group.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const groupStatus_enum_1 = require("../../common/enums/groupStatus.enum");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const BaseService_1 = require("../../infrastructure/utils/BaseService");
let GroupsService = class GroupsService extends BaseService_1.BaseService {
    groupRepo;
    constructor(groupRepo) {
        super(groupRepo);
        this.groupRepo = groupRepo;
    }
    async checkTeacherAvailability(teacherId, lessonDays, lessonTime, excludeGroupId) {
        if (!teacherId || !lessonDays || lessonDays.length === 0 || !lessonTime)
            return;
        const existingGroups = await this.groupRepo.find({
            where: {
                teacherId,
                status: groupStatus_enum_1.GroupStatus.ACTIVE,
                ...(excludeGroupId ? { id: (0, typeorm_2.Not)(excludeGroupId) } : {}),
            },
        });
        for (const group of existingGroups) {
            if (!group.lessonTime || !group.lessonDays)
                continue;
            const overlappingDays = group.lessonDays.filter((day) => lessonDays.includes(day));
            if (overlappingDays.length > 0 && group.lessonTime === lessonTime) {
                throw new common_1.BadRequestException(`O'qituvchi "${group.name}" guruhida ${overlappingDays.join(', ')} kuni soat ${lessonTime} da band. Boshqa vaqt yoki o'qituvchi tanlang.`);
            }
        }
    }
    async create(dto) {
        await this.checkTeacherAvailability(dto.teacherId, dto.lessonDays, dto.lessonTime);
        return super.create(dto);
    }
    async update(id, dto) {
        const existing = await this.groupRepo.findOne({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Guruh topilmadi');
        const teacherId = dto.teacherId ?? existing.teacherId;
        const lessonDays = dto.lessonDays ?? existing.lessonDays;
        const lessonTime = dto.lessonTime ?? existing.lessonTime;
        await this.checkTeacherAvailability(teacherId, lessonDays, lessonTime, id);
        return super.update(id, dto);
    }
    async findAll(currentUser, query) {
        const where = {};
        if (query?.name)
            where.name = (0, typeorm_2.ILike)(`%${query.name}%`);
        if (query?.teacherId)
            where.teacherId = Number(query.teacherId);
        if (query?.directionId)
            where.directionId = Number(query.directionId);
        if (query?.branchId)
            where.branchId = Number(query.branchId);
        let baseWhere;
        if ([role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN].includes(currentUser.role)) {
            baseWhere = where;
        }
        else if (currentUser.role === role_enum_1.UserRole.SUPPORT) {
            baseWhere = { ...where, directionId: currentUser.directionId };
        }
        else {
            baseWhere = { ...where, teacherId: currentUser.id };
        }
        const groups = await this.groupRepo.find({
            where: baseWhere,
            relations: ['teacher', 'direction', 'students'],
        });
        return (0, succes_res_1.succesRes)(groups);
    }
    async findOneWithStudents(id) {
        const group = await this.groupRepo.findOne({
            where: { id },
            relations: ['teacher', 'direction', 'students', 'students.user', 'support'],
        });
        if (!group)
            throw new common_1.NotFoundException('Group topilmadi');
        return (0, succes_res_1.succesRes)(group);
    }
    async updateStatus(id, status) {
        await this.groupRepo.update(id, { status });
        return (0, succes_res_1.succesRes)({ message: 'Guruh holati yangilandi' });
    }
    async getGroupScore(id) {
        const group = await this.groupRepo.findOne({
            where: { id },
            relations: [
                'students',
                'students.results',
                'students.attendance',
                'students.user',
            ],
        });
        if (!group)
            throw new common_1.NotFoundException('Group topilmadi');
        const students = group.students ?? [];
        const total = students.length;
        let totalScore = 0;
        let testCount = 0;
        students.forEach((s) => {
            (s.results ?? []).forEach((r) => {
                totalScore += r.score ?? 0;
                testCount++;
            });
        });
        const avgScore = testCount > 0 ? Math.round(totalScore / testCount) : 0;
        let presentCount = 0;
        let attTotal = 0;
        students.forEach((s) => {
            (s.attendance ?? []).forEach((a) => {
                attTotal++;
                if (a.isPresent)
                    presentCount++;
            });
        });
        const attendanceRate = attTotal > 0 ? Math.round((presentCount / attTotal) * 100) : 0;
        const overallScore = Math.round((avgScore + attendanceRate) / 2);
        const grade = overallScore >= 90 ? 'A' :
            overallScore >= 75 ? 'B' :
                overallScore >= 60 ? 'C' :
                    overallScore >= 45 ? 'D' : 'F';
        return (0, succes_res_1.succesRes)({
            groupId: id,
            groupName: group.name,
            totalStudents: total,
            avgTestScore: avgScore,
            attendanceRate,
            overallScore,
            grade,
        });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GroupsService);
//# sourceMappingURL=groups.service.js.map