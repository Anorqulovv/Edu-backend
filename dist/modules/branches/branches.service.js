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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_entity_1 = require("../../databases/entities/branch.entity");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let BranchesService = class BranchesService {
    branchRepo;
    constructor(branchRepo) {
        this.branchRepo = branchRepo;
    }
    async create(dto) {
        const exists = await this.branchRepo.findOne({ where: { name: dto.name } });
        if (exists)
            throw new common_1.ConflictException('Bu nomdagi filial allaqachon mavjud');
        const branch = this.branchRepo.create(dto);
        const saved = await this.branchRepo.save(branch);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll(name) {
        const where = name ? { name: (0, typeorm_2.ILike)(`%${name}%`) } : {};
        const data = await this.branchRepo.find({ where, order: { name: 'ASC' } });
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id) {
        const branch = await this.branchRepo.findOne({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException(`Filial ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(branch);
    }
    async update(id, dto) {
        const branch = await this.branchRepo.findOne({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException(`Filial ID ${id} topilmadi`);
        if (dto.name) {
            const exists = await this.branchRepo.findOne({ where: { name: dto.name, id: (0, typeorm_2.Not)(id) } });
            if (exists)
                throw new common_1.ConflictException('Bu nomdagi filial allaqachon mavjud');
        }
        await this.branchRepo.update(id, dto);
        const updated = await this.branchRepo.findOne({ where: { id } });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const branch = await this.branchRepo.findOne({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException(`Filial ID ${id} topilmadi`);
        await this.branchRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Filial o\'chirildi' });
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BranchesService);
//# sourceMappingURL=branches.service.js.map