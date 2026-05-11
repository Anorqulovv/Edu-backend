import { Repository } from 'typeorm';
import { Branch } from "../../databases/entities/branch.entity";
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class BranchesService {
    private readonly branchRepo;
    constructor(branchRepo: Repository<Branch>);
    create(dto: CreateBranchDto): Promise<ISucces>;
    findAll(name?: string): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateBranchDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
