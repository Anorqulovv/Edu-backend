import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseService } from "../../infrastructure/utils/BaseService";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { User } from "../../databases/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class UsersService extends BaseService<CreateUserDto, UpdateUserDto, User> implements OnModuleInit {
    private readonly userRepo;
    private readonly crypto;
    constructor(userRepo: Repository<User>, crypto: CryptoService);
    onModuleInit(): Promise<void>;
    createUser(dto: CreateUserDto, role: UserRole): Promise<ISucces>;
    findAllByRole(role: UserRole, query?: any): Promise<ISucces>;
    findOneByRole(id: number, role: UserRole): Promise<ISucces>;
    updateUser(id: number, dto: UpdateUserDto): Promise<ISucces>;
    removeUser(id: number): Promise<ISucces>;
    getDashboardStats(): Promise<ISucces>;
}
