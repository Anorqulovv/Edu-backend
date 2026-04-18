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
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const test_entity_1 = require("../../databases/entities/test.entity");
const test_result_entity_1 = require("../../databases/entities/test-result.entity");
const student_entity_1 = require("../../databases/entities/student.entity");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let TestsService = class TestsService {
    testRepo;
    resultRepo;
    studentRepo;
    constructor(testRepo, resultRepo, studentRepo) {
        this.testRepo = testRepo;
        this.resultRepo = resultRepo;
        this.studentRepo = studentRepo;
    }
    async create(dto) {
        const test = this.testRepo.create(dto);
        const saved = await this.testRepo.save(test);
        return (0, succes_res_1.succesRes)(saved, 201);
    }
    async findAll() {
        const data = await this.testRepo.find({ order: { createdAt: 'DESC' } });
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id) {
        const data = await this.testRepo.findOne({ where: { id } });
        if (!data)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(data);
    }
    async update(id, dto) {
        const test = await this.testRepo.findOne({ where: { id } });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        await this.testRepo.update(id, dto);
        const updated = await this.testRepo.findOne({ where: { id } });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const test = await this.testRepo.findOne({ where: { id } });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${id} topilmadi`);
        await this.testRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Test o‘chirildi' });
    }
    async addScore(dto) {
        const test = await this.testRepo.findOne({ where: { id: dto.testId } });
        if (!test)
            throw new common_1.NotFoundException('Test topilmadi');
        const student = await this.studentRepo.findOne({ where: { id: dto.studentId } });
        if (!student)
            throw new common_1.NotFoundException('O‘quvchi topilmadi');
        const result = this.resultRepo.create({
            testId: dto.testId,
            studentId: dto.studentId,
            score: dto.score,
        });
        const savedResult = await this.resultRepo.save(result);
        return (0, succes_res_1.succesRes)(savedResult);
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(test_entity_1.Test)),
    __param(1, (0, typeorm_1.InjectRepository)(test_result_entity_1.TestResult)),
    __param(2, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TestsService);
//# sourceMappingURL=tests.service.js.map