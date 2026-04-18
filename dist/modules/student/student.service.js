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
const group_entity_1 = require("../../databases/entities/group.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let StudentsService = class StudentsService {
    studentRepo;
    groupRepo;
    usersService;
    constructor(studentRepo, groupRepo, usersService) {
        this.studentRepo = studentRepo;
        this.groupRepo = groupRepo;
        this.usersService = usersService;
    }
    async createWithUser(userDto, studentExtra) {
        const userResult = await this.usersService.createUser(userDto, role_enum_1.UserRole.STUDENT);
        const newUser = userResult.data;
        const student = this.studentRepo.create({
            userId: newUser.id,
            ...studentExtra,
        });
        const saved = await this.studentRepo.save(student);
        return (0, succes_res_1.succesRes)({ user: newUser, student: saved }, 201);
    }
    async create(dto) {
        const user = await this.usersService.getRepository.findOneBy({ id: dto.userId });
        if (!user || user.role !== role_enum_1.UserRole.STUDENT) {
            throw new common_1.NotFoundException('STUDENT roli bilan user topilmadi');
        }
        const exists = await this.studentRepo.findOneBy({ userId: dto.userId });
        if (exists) {
            throw new common_1.NotFoundException('Bu user uchun student profil allaqachon mavjud');
        }
        if (dto.groupId) {
            const group = await this.groupRepo.findOneBy({ id: dto.groupId });
            if (!group)
                throw new common_1.NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
        }
        const student = this.studentRepo.create(dto);
        const saved = await this.studentRepo.save(student);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll(currentUser) {
        let students;
        if ([role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.SUPPORT].includes(currentUser.role)) {
            students = await this.studentRepo.find({
                relations: ['user', 'parent', 'group', 'group.teacher'],
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
            relations: ['user', 'parent', 'group', 'attendance', 'results'],
        });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(student);
    }
    async update(id, dto) {
        const student = await this.studentRepo.findOneBy({ id });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        if (dto.groupId) {
            const group = await this.groupRepo.findOneBy({ id: dto.groupId });
            if (!group)
                throw new common_1.NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
        }
        await this.studentRepo.update(id, dto);
        const updated = await this.studentRepo.findOne({
            where: { id },
            relations: ['user', 'parent', 'group'],
        });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const student = await this.studentRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!student)
            throw new common_1.NotFoundException(`Student ID ${id} topilmadi`);
        await this.usersService.removeUser(student.userId);
        return (0, succes_res_1.succesRes)({ message: 'Student va uning user akkaunt muvaffaqiyatli o\'chirildi' });
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], StudentsService);
//# sourceMappingURL=student.service.js.map