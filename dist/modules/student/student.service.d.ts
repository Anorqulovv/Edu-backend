import { Repository } from 'typeorm';
import { Student } from "../../databases/entities/student.entity";
import { Group } from "../../databases/entities/group.entity";
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UsersService } from "../users/users.service";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { CreateUserDto } from "../users/dto/create-user.dto";
export declare class StudentsService {
    private readonly studentRepo;
    private readonly groupRepo;
    private readonly usersService;
    constructor(studentRepo: Repository<Student>, groupRepo: Repository<Group>, usersService: UsersService);
    createWithUser(userDto: CreateUserDto, studentExtra: Omit<CreateStudentDto, 'userId'>): Promise<ISucces>;
    create(dto: CreateStudentDto): Promise<ISucces>;
    findAll(currentUser: any): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateStudentDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
