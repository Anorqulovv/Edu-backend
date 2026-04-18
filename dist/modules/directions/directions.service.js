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
exports.DirectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const direction_entity_1 = require("../../databases/entities/direction.entity");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let DirectionService = class DirectionService {
    directionRepo;
    constructor(directionRepo) {
        this.directionRepo = directionRepo;
    }
    async create(dto) {
        const exists = await this.directionRepo.findOne({ where: { name: dto.name } });
        if (exists)
            throw new common_1.ConflictException('Bu nomdagi yo‘nalish allaqachon mavjud');
        const direction = this.directionRepo.create(dto);
        const saved = await this.directionRepo.save(direction);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll() {
        const data = await this.directionRepo.find({ order: { name: 'ASC' } });
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id) {
        const data = await this.directionRepo.findOne({ where: { id } });
        if (!data)
            throw new common_1.NotFoundException(`Yo‘nalish ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(data);
    }
    async update(id, dto) {
        const direction = await this.directionRepo.findOne({ where: { id } });
        if (!direction)
            throw new common_1.NotFoundException(`Yo‘nalish ID ${id} topilmadi`);
        if (dto.name) {
            const exists = await this.directionRepo.findOne({
                where: { name: dto.name, id: (0, typeorm_2.Not)(id) },
            });
            if (exists)
                throw new common_1.ConflictException('Bu nomdagi yo‘nalish allaqachon mavjud');
        }
        await this.directionRepo.update(id, dto);
        const updated = await this.directionRepo.findOne({ where: { id } });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const direction = await this.directionRepo.findOne({ where: { id } });
        if (!direction)
            throw new common_1.NotFoundException(`Yo‘nalish ID ${id} topilmadi`);
        await this.directionRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Yo‘nalish o‘chirildi' });
    }
};
exports.DirectionService = DirectionService;
exports.DirectionService = DirectionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(direction_entity_1.Direction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DirectionService);
//# sourceMappingURL=directions.service.js.map