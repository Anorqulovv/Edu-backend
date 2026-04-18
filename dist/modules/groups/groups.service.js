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
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const BaseService_1 = require("../../infrastructure/utils/BaseService");
let GroupsService = class GroupsService extends BaseService_1.BaseService {
    groupRepo;
    constructor(groupRepo) {
        super(groupRepo);
        this.groupRepo = groupRepo;
    }
    async findAll(currentUser) {
        let groups;
        if ([role_enum_1.UserRole.SUPERADMIN, role_enum_1.UserRole.ADMIN].includes(currentUser.role)) {
            groups = await this.groupRepo.find({
                relations: ['teacher', 'direction', 'students'],
            });
        }
        else {
            groups = await this.groupRepo.find({
                where: { teacherId: currentUser.id },
                relations: ['teacher', 'direction', 'students'],
            });
        }
        return (0, succes_res_1.succesRes)(groups);
    }
    async findOneWithStudents(id) {
        const group = await this.groupRepo.findOne({
            where: { id },
            relations: ['teacher', 'direction', 'students', 'students.user'],
        });
        if (!group)
            throw new common_1.NotFoundException('Group topilmadi');
        return (0, succes_res_1.succesRes)(group);
    }
    async updateStatus(id, status) {
        await this.groupRepo.update(id, { status });
        return (0, succes_res_1.succesRes)({ message: 'Guruh holati yangilandi' });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GroupsService);
//# sourceMappingURL=groups.service.js.map