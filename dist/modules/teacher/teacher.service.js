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
exports.TeacherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../databases/entities/user.entity");
const group_entity_1 = require("../../databases/entities/group.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const Crypto_1 = require("../../infrastructure/helpers/Crypto");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let TeacherService = class TeacherService {
    userRepo;
    groupRepo;
    crypto;
    constructor(userRepo, groupRepo, crypto) {
        this.userRepo = userRepo;
        this.groupRepo = groupRepo;
        this.crypto = crypto;
    }
    async create(dto) {
        const exists = await this.userRepo.findOne({ where: [{ username: dto.username }, { phone: dto.phone }] });
        if (exists) {
            if (exists.username === dto.username)
                throw new common_1.ConflictException('username allaqachon mavjud');
            throw new common_1.ConflictException('telefon raqami allaqachon mavjud');
        }
        const hashed = await this.crypto.hashPassword(dto.password);
        const directionId = dto.directionId ?? (dto.directionIds?.length ? dto.directionIds[0] : undefined);
        const user = this.userRepo.create({ ...dto, password: hashed, role: role_enum_1.UserRole.TEACHER, directionId });
        const saved = await this.userRepo.save(user);
        const { password: _, ...result } = saved;
        return (0, succes_res_1.succesRes)(result, 201);
    }
    async findAll(query) {
        const where = { role: role_enum_1.UserRole.TEACHER };
        if (query?.directionId)
            where.directionId = Number(query.directionId);
        if (query?.branchId)
            where.branchId = Number(query.branchId);
        if (query?.name)
            where.fullName = (0, typeorm_2.ILike)(`%${query.name}%`);
        const users = await this.userRepo.find({ where, relations: ['direction', 'branch'], order: { createdAt: 'DESC' } });
        const result = users.map(({ password: _, ...u }) => u);
        return (0, succes_res_1.succesRes)(result);
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({ where: { id, role: role_enum_1.UserRole.TEACHER }, relations: ['direction'] });
        if (!user)
            throw new common_1.NotFoundException(`Teacher ID ${id} topilmadi`);
        const { password: _, ...result } = user;
        return (0, succes_res_1.succesRes)(result);
    }
    async getMyGroups(teacherId) {
        const groups = await this.groupRepo.find({
            where: { teacherId },
            relations: ['students', 'students.user', 'direction'],
            order: { createdAt: 'DESC' },
        });
        return (0, succes_res_1.succesRes)(groups);
    }
    async update(id, dto) {
        const user = await this.userRepo.findOne({ where: { id, role: role_enum_1.UserRole.TEACHER } });
        if (!user)
            throw new common_1.NotFoundException(`Teacher ID ${id} topilmadi`);
        if (dto.username && dto.username !== user.username) {
            const dup = await this.userRepo.findOne({ where: { username: dto.username, id: (0, typeorm_2.Not)(id) } });
            if (dup)
                throw new common_1.ConflictException('username allaqachon mavjud');
        }
        if (dto.phone && dto.phone !== user.phone) {
            const dup = await this.userRepo.findOne({ where: { phone: dto.phone, id: (0, typeorm_2.Not)(id) } });
            if (dup)
                throw new common_1.ConflictException('telefon raqami allaqachon mavjud');
        }
        if (dto.password)
            dto.password = await this.crypto.hashPassword(dto.password);
        if (dto.directionIds?.length)
            dto.directionId = dto.directionIds[0];
        await this.userRepo.update(id, dto);
        const updated = await this.userRepo.findOne({ where: { id }, relations: ['direction'] });
        const { password: _, ...result } = updated;
        return (0, succes_res_1.succesRes)(result);
    }
    async remove(id) {
        const user = await this.userRepo.findOne({ where: { id, role: role_enum_1.UserRole.TEACHER } });
        if (!user)
            throw new common_1.NotFoundException(`Teacher ID ${id} topilmadi`);
        const groupsCount = await this.groupRepo.count({ where: { teacherId: id } });
        if (groupsCount > 0) {
            throw new common_1.ConflictException(`Bu teacher ${groupsCount} ta guruhga biriktirilgan. Avval guruhlarni ozgartiring.`);
        }
        await this.userRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Teacher muvaffaqiyatli ochirildi' });
    }
};
exports.TeacherService = TeacherService;
exports.TeacherService = TeacherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        Crypto_1.CryptoService])
], TeacherService);
//# sourceMappingURL=teacher.service.js.map