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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_enum_1 = require("../../common/enums/role.enum");
const users_service_1 = require("./users.service");
const group_entity_1 = require("../../databases/entities/group.entity");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let TeachersService = class TeachersService {
    usersService;
    groupRepo;
    constructor(usersService, groupRepo) {
        this.usersService = usersService;
        this.groupRepo = groupRepo;
    }
    async getMyGroups(teacherId) {
        const groups = await this.groupRepo.find({
            where: { teacherId },
            relations: ['students', 'students.user'],
            order: { createdAt: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(groups);
    }
    async update(id, dto) {
        const existing = await this.usersService.getRepository.findOne({
            where: { id, role: role_enum_1.UserRole.TEACHER },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Teacher ID ${id} topilmadi`);
        return this.usersService.updateUser(id, dto);
    }
    async remove(id) {
        const existing = await this.usersService.getRepository.findOne({
            where: { id, role: role_enum_1.UserRole.TEACHER },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Teacher ID ${id} topilmadi`);
        const groupsCount = await this.groupRepo.count({ where: { teacherId: id } });
        if (groupsCount > 0) {
            throw new common_1.ConflictException(`Bu o'qituvchi ${groupsCount} ta guruhga biriktirilgan. Avval guruhlarni o'zgartiring.`);
        }
        return this.usersService.removeUser(id);
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_2.Repository])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map