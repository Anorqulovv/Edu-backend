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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const BaseService_1 = require("../../infrastructure/utils/BaseService");
const Crypto_1 = require("../../infrastructure/helpers/Crypto");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
const user_entity_1 = require("../../databases/entities/user.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const config_1 = require("../../common/config");
let UsersService = class UsersService extends BaseService_1.BaseService {
    userRepo;
    crypto;
    constructor(userRepo, crypto) {
        super(userRepo);
        this.userRepo = userRepo;
        this.crypto = crypto;
    }
    async onModuleInit() {
        const existsSuperAdmin = await this.userRepo.findOne({
            where: { role: role_enum_1.UserRole.SUPERADMIN },
        });
        if (!existsSuperAdmin) {
            let phone = config_1.envConfig.SUPERADMIN.PHONE;
            phone = phone.replace(/[^+\d]/g, '');
            if (!phone.startsWith('+998')) {
                phone = '+998' + phone.replace(/^\+?998?/, '');
            }
            const superAdmin = this.userRepo.create({
                username: config_1.envConfig.SUPERADMIN.USERNAME,
                phone,
                password: await this.crypto.hashPassword(config_1.envConfig.SUPERADMIN.PASSWORD),
                role: role_enum_1.UserRole.SUPERADMIN,
                fullName: 'Super Admin',
            });
            await this.userRepo.save(superAdmin);
            console.log(`✅ Superadmin yaratildi: ${phone}`);
        }
    }
    async createUser(dto, role) {
        const { username, phone, password } = dto;
        const exists = await this.userRepo.findOne({
            where: [{ username }, { phone }],
        });
        if (exists) {
            if (exists.username === username)
                throw new common_1.ConflictException('username already exists');
            if (exists.phone === phone)
                throw new common_1.ConflictException('phone already exists');
        }
        const hashPass = await this.crypto.hashPassword(password);
        const directionId = dto.directionId ?? (dto.directionIds && dto.directionIds.length > 0 ? dto.directionIds[0] : undefined);
        const user = this.userRepo.create({
            ...dto,
            password: hashPass,
            role,
            directionId,
        });
        const saved = await this.userRepo.save(user);
        const { password: _, ...result } = saved;
        return (0, succes_res_1.succesRes)(result, 201);
    }
    async findAllByRole(role, query) {
        const where = { role };
        if (query?.directionId)
            where.directionId = Number(query.directionId);
        if (query?.branchId)
            where.branchId = Number(query.branchId);
        if (query?.name)
            where.fullName = (0, typeorm_2.ILike)(`%${query.name}%`);
        const users = await this.userRepo.find({
            where,
            relations: ['direction', 'branch'],
            order: { createdAt: 'DESC' },
        });
        const result = users.map(({ password: _, ...user }) => user);
        return (0, succes_res_1.succesRes)(result);
    }
    async findOneByRole(id, role) {
        const user = await this.userRepo.findOne({
            where: { id, role },
            relations: ['direction', 'branch'],
        });
        if (!user)
            throw new common_1.NotFoundException(`${role} with ID ${id} not found`);
        const { password: _, ...result } = user;
        return (0, succes_res_1.succesRes)(result);
    }
    async updateUser(id, dto) {
        const current = await this.userRepo.findOneBy({ id });
        if (!current)
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        if (dto.username && dto.username !== current.username) {
            const dup = await this.userRepo.findOne({
                where: { username: dto.username, id: (0, typeorm_2.Not)(id) },
            });
            if (dup)
                throw new common_1.ConflictException('username already exists');
        }
        if (dto.phone && dto.phone !== current.phone) {
            const dup = await this.userRepo.findOne({
                where: { phone: dto.phone, id: (0, typeorm_2.Not)(id) },
            });
            if (dup)
                throw new common_1.ConflictException('phone already exists');
        }
        if (dto.password) {
            dto.password = await this.crypto.hashPassword(dto.password);
        }
        if (dto.directionIds && dto.directionIds.length > 0) {
            dto.directionId = dto.directionIds[0];
        }
        await this.userRepo.update(id, dto);
        const updated = await this.userRepo.findOne({
            where: { id },
            relations: ['direction', 'branch'],
        });
        const { password: _, ...result } = updated;
        return (0, succes_res_1.succesRes)(result);
    }
    async removeUser(id) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user)
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        await this.userRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Successfully deleted' });
    }
    async getDashboardStats() {
        const [totalAdmins, totalTeachers, totalSupports, totalParents] = await Promise.all([
            this.userRepo.count({ where: { role: role_enum_1.UserRole.ADMIN } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.TEACHER } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.SUPPORT } }),
            this.userRepo.count({ where: { role: role_enum_1.UserRole.PARENT } }),
        ]);
        return (0, succes_res_1.succesRes)({ totalAdmins, totalTeachers, totalSupports, totalParents });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        Crypto_1.CryptoService])
], UsersService);
//# sourceMappingURL=users.service.js.map