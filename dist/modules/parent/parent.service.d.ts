import { Repository } from 'typeorm';
import { Parent } from "../../databases/entities/parent.entity";
import { Student } from "../../databases/entities/student.entity";
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { UsersService } from "../users/users.service";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateUserDto } from "../users/dto/create-user.dto";
export declare class ParentsService {
    private readonly parentRepo;
    private readonly studentRepo;
    private readonly usersService;
    constructor(parentRepo: Repository<Parent>, studentRepo: Repository<Student>, usersService: UsersService);
    createWithUser(userDto: CreateUserDto): Promise<ISucces>;
    create(dto: CreateParentDto): Promise<ISucces>;
    findAll(): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    getMyChildren(parentUserId: number): Promise<ISucces>;
    update(id: number, dto: UpdateParentDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
