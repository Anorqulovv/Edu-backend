import { Repository } from 'typeorm';
import { Student } from "../../databases/entities/student.entity";
import { Parent } from "../../databases/entities/parent.entity";
import { User } from "../../databases/entities/user.entity";
import { Group } from "../../databases/entities/group.entity";
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UsersService } from "../users/users.service";
import { TelegramService } from "../telegram/telegram.service";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateUserDto } from "../users/dto/create-user.dto";
export declare class StudentsService {
    private readonly studentRepo;
    private readonly groupRepo;
    private readonly parentRepo;
    private readonly userRepo;
    private readonly usersService;
    private readonly telegramService;
    constructor(studentRepo: Repository<Student>, groupRepo: Repository<Group>, parentRepo: Repository<Parent>, userRepo: Repository<User>, usersService: UsersService, telegramService: TelegramService);
    createWithUser(userDto: CreateUserDto, studentExtra: Omit<CreateStudentDto, 'userId'>, parentDto?: {
        fullName: string;
        phone: string;
        phone2?: string;
        username?: string;
        password?: string;
        telegramId?: string;
    }): Promise<ISucces>;
    create(dto: CreateStudentDto): Promise<ISucces>;
    findAll(currentUser: any): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateStudentDto): Promise<ISucces>;
    findAllWithParentIds(): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
