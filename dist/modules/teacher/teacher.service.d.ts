import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
import { Group } from "../../databases/entities/group.entity";
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeacherService {
    private readonly userRepo;
    private readonly groupRepo;
    private readonly crypto;
    constructor(userRepo: Repository<User>, groupRepo: Repository<Group>, crypto: CryptoService);
    create(dto: CreateTeacherDto): Promise<ISucces>;
    findAll(query?: any): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    getMyGroups(teacherId: number): Promise<ISucces>;
    update(id: number, dto: UpdateTeacherDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
