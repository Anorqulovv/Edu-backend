import { ObjectLiteral, Repository } from 'typeorm';
import { IFindOptions, IResponsePagination } from '../utils/succes-interface';
export declare class RepositoryPager {
    static readonly DEFAULT_PAGE = 1;
    static readonly DEFAULT_PAGE_size = 10;
    static findAll<T extends ObjectLiteral>(repository: Repository<T>, options?: IFindOptions<T>): Promise<IResponsePagination>;
    private static normalizePagination;
}
