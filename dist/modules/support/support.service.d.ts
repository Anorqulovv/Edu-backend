import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
export declare class SupportService {
    private readonly userRepo;
    private readonly crypto;
    constructor(userRepo: Repository<User>, crypto: CryptoService);
    create(dto: CreateSupportDto): Promise<ISucces>;
    findAll(query?: any): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateSupportDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
