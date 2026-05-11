"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryPager = void 0;
const Pager_1 = require("./Pager");
class RepositoryPager {
    static DEFAULT_PAGE = 1;
    static DEFAULT_PAGE_size = 10;
    static async findAll(repository, options) {
        const [data, count] = await repository.findAndCount(RepositoryPager.normalizePagination(options));
        return Pager_1.Pager.of(200, 'succes', data, count, options?.take ?? this.DEFAULT_PAGE_size, options?.skip ?? this.DEFAULT_PAGE);
    }
    static normalizePagination(options) {
        let page = (options?.skip ?? this.DEFAULT_PAGE) - 1;
        return {
            ...options,
            take: options?.take,
            skip: page * (options?.take ?? RepositoryPager.DEFAULT_PAGE_size),
        };
    }
}
exports.RepositoryPager = RepositoryPager;
//# sourceMappingURL=RepositoryPager.js.map