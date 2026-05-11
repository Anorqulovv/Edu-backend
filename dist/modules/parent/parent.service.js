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
exports.ParentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_entity_1 = require("../../databases/entities/parent.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let ParentsService = class ParentsService {
    parentRepo;
    studentRepo;
    usersService;
    constructor(parentRepo, studentRepo, usersService) {
        this.parentRepo = parentRepo;
        this.studentRepo = studentRepo;
        this.usersService = usersService;
    }
    async createWithUser(userDto) {
        const userResult = await this.usersService.createUser(userDto, role_enum_1.UserRole.PARENT);
        const newUser = userResult.data;
        const parent = this.parentRepo.create({ userId: newUser.id });
        const saved = await this.parentRepo.save(parent);
        return (0, succes_res_1.succesRes)({ user: newUser, parent: saved }, 201);
    }
    async create(dto) {
        const user = await this.usersService.getRepository.findOne({
            where: { id: dto.userId, role: role_enum_1.UserRole.PARENT },
        });
        if (!user)
            throw new common_1.NotFoundException('PARENT roli bilan user topilmadi');
        const exists = await this.parentRepo.findOneBy({ userId: dto.userId });
        if (exists)
            throw new common_1.ConflictException('Bu user uchun parent profil allaqachon mavjud');
        const parent = this.parentRepo.create(dto);
        const saved = await this.parentRepo.save(parent);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll() {
        const parents = await this.parentRepo.find({
            relations: ['user', 'students', 'students.user'],
            order: { createdAt: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(parents);
    }
    async findOne(id) {
        const parent = await this.parentRepo.findOne({
            where: { id },
            relations: ['user', 'students', 'students.group'],
        });
        if (!parent)
            throw new common_1.NotFoundException(`Parent ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(parent);
    }
    async getMyChildren(parentUserId) {
        const children = await this.studentRepo.find({
            where: { parent: { userId: parentUserId } },
            relations: ['user', 'group', 'group.teacher'],
            order: { createdAt: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(children);
    }
    async update(id, dto) {
        const existing = await this.parentRepo.findOneBy({ id });
        if (!existing)
            throw new common_1.NotFoundException(`Parent ID ${id} topilmadi`);
        await this.parentRepo.update(id, dto);
        const updated = await this.parentRepo.findOne({
            where: { id },
            relations: ['user', 'students'],
        });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const existing = await this.parentRepo.findOne({
            where: { id },
            relations: ['students'],
        });
        if (!existing)
            throw new common_1.NotFoundException(`Parent ID ${id} topilmadi`);
        if (existing.students?.length > 0) {
            throw new common_1.ConflictException(`Bu ota-ona ${existing.students.length} nafar o'quvchiga bog'langan. Avval bog'lanishlarni o'chiring.`);
        }
        await this.usersService.removeUser(existing.userId);
        return (0, succes_res_1.succesRes)({ message: 'Parent muvaffaqiyatli o\'chirildi' });
    }
};
exports.ParentsService = ParentsService;
exports.ParentsService = ParentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], ParentsService);
//# sourceMappingURL=parent.service.js.map