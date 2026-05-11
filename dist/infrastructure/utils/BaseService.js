"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const common_1 = require("@nestjs/common");
const succes_res_1 = require("./succes-res");
const pagination_1 = require("../pagination");
class BaseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    get getRepository() {
        return this.repository;
    }
    async create(dto) {
        const entity = this.repository.create(dto);
        const data = await this.repository.save(entity);
        return (0, succes_res_1.succesRes)(data, 201);
    }
    async findAll(options) {
        const data = await this.repository.find({
            ...options,
        });
        return (0, succes_res_1.succesRes)(data);
    }
    async findAllWithPagination(options) {
        return await pagination_1.RepositoryPager.findAll(this.getRepository, options);
    }
    async findOneBy(options) {
        const data = await this.repository.findOne({
            ...options,
        });
        if (!data) {
            throw new common_1.HttpException('not found', 404);
        }
        return (0, succes_res_1.succesRes)(data);
    }
    async findOneById(id, options) {
        const data = await this.repository.findOne({
            ...options,
            where: {
                ...options?.where,
                id,
            },
        });
        if (!data) {
            throw new common_1.HttpException('not found', 404);
        }
        return (0, succes_res_1.succesRes)(data);
    }
    async update(id, dto) {
        await this.findOneById(id);
        await this.repository.update(id, dto);
        const data = await this.repository.findOne({
            where: { id },
        });
        return (0, succes_res_1.succesRes)(data);
    }
    async delete(id) {
        await this.findOneById(id);
        await this.repository.delete(id);
        return (0, succes_res_1.succesRes)({ message: 'Successfully deleted' });
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map