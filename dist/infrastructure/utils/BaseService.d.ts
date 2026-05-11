import { Repository } from 'typeorm';
import { IFindOptions, IResponsePagination, ISucces } from './succes-interface';
export declare class BaseService<CreateDto, UpdateDto, Entity extends {
    id: number;
}> {
    protected readonly repository: Repository<Entity>;
    constructor(repository: Repository<Entity>);
    get getRepository(): Repository<Entity>;
    create(dto: CreateDto): Promise<ISucces>;
    findAll(options?: IFindOptions<Entity>): Promise<ISucces>;
    findAllWithPagination(options?: IFindOptions<Entity>): Promise<IResponsePagination>;
    findOneBy(options: IFindOptions<Entity>): Promise<ISucces>;
    findOneById(id: number, options?: IFindOptions<Entity>): Promise<ISucces>;
    update(id: number, dto: UpdateDto): Promise<ISucces>;
    delete(id: number): Promise<ISucces>;
}
