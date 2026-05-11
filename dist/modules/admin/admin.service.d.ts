import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class AdminService {
    private readonly userRepo;
    private readonly crypto;
    constructor(userRepo: Repository<User>, crypto: CryptoService);
    create(dto: CreateAdminDto): Promise<ISucces>;
    findAll(): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateAdminDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
