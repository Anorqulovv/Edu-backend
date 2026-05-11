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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../../databases/entities/question.entity");
const choice_entity_1 = require("../../databases/entities/choice.entity");
const test_entity_1 = require("../../databases/entities/test.entity");
const succes_res_1 = require("../../infrastructure/utils/succes-res");
let QuestionsService = class QuestionsService {
    questionRepo;
    choiceRepo;
    testRepo;
    constructor(questionRepo, choiceRepo, testRepo) {
        this.questionRepo = questionRepo;
        this.choiceRepo = choiceRepo;
        this.testRepo = testRepo;
    }
    async create(dto) {
        const test = await this.testRepo.findOne({ where: { id: dto.testId } });
        if (!test)
            throw new common_1.NotFoundException(`Test ID ${dto.testId} topilmadi`);
        const correctCount = dto.choices.filter((c) => c.isCorrect).length;
        if (correctCount === 0) {
            throw new common_1.BadRequestException('Kamida bitta to\'g\'ri variant bo\'lishi kerak');
        }
        const question = this.questionRepo.create({
            text: dto.text,
            testId: dto.testId,
        });
        const savedQuestion = await this.questionRepo.save(question);
        const choices = dto.choices.map((c) => this.choiceRepo.create({ ...c, questionId: savedQuestion.id }));
        await this.choiceRepo.save(choices);
        const result = await this.questionRepo.findOne({
            where: { id: savedQuestion.id },
            relations: ['choices'],
        });
        return (0, succes_res_1.succesRes)(result, 201);
    }
    async findAll(testId, type) {
        const query = this.questionRepo
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.choices', 'choices')
            .leftJoinAndSelect('question.test', 'test')
            .orderBy('question.createdAt', 'DESC');
        if (testId) {
            query.andWhere('question.testId = :testId', { testId });
        }
        if (type) {
            query.andWhere('test.type = :type', { type });
        }
        const data = await query.getMany();
        return (0, succes_res_1.succesRes)(data);
    }
    async findByType(type) {
        const data = await this.questionRepo
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.choices', 'choices')
            .leftJoinAndSelect('question.test', 'test')
            .where('test.type = :type', { type })
            .orderBy('question.createdAt', 'DESC')
            .getMany();
        return (0, succes_res_1.succesRes)(data);
    }
    async findOne(id) {
        const data = await this.questionRepo.findOne({
            where: { id },
            relations: ['choices', 'test'],
        });
        if (!data)
            throw new common_1.NotFoundException(`Savol ID ${id} topilmadi`);
        return (0, succes_res_1.succesRes)(data);
    }
    async update(id, dto) {
        const question = await this.questionRepo.findOne({
            where: { id },
            relations: ['choices'],
        });
        if (!question)
            throw new common_1.NotFoundException(`Savol ID ${id} topilmadi`);
        if (dto.testId) {
            const test = await this.testRepo.findOne({ where: { id: dto.testId } });
            if (!test)
                throw new common_1.NotFoundException(`Test ID ${dto.testId} topilmadi`);
        }
        if (dto.text) {
            await this.questionRepo.update(id, { text: dto.text, testId: dto.testId });
        }
        if (dto.choices && dto.choices.length > 0) {
            const correctCount = dto.choices.filter((c) => c.isCorrect).length;
            if (correctCount === 0) {
                throw new common_1.BadRequestException('Kamida bitta to\'g\'ri variant bo\'lishi kerak');
            }
            await this.choiceRepo.delete({ questionId: id });
            const choices = dto.choices.map((c) => this.choiceRepo.create({ ...c, questionId: id }));
            await this.choiceRepo.save(choices);
        }
        const updated = await this.questionRepo.findOne({
            where: { id },
            relations: ['choices', 'test'],
        });
        return (0, succes_res_1.succesRes)(updated);
    }
    async remove(id) {
        const question = await this.questionRepo.findOne({ where: { id } });
        if (!question)
            throw new common_1.NotFoundException(`Savol ID ${id} topilmadi`);
        await this.questionRepo.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Savol o\'chirildi' });
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(choice_entity_1.Choice)),
    __param(2, (0, typeorm_1.InjectRepository)(test_entity_1.Test)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map