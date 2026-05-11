import { StudentsService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateUserDto } from "../users/dto/create-user.dto";
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(userDto: CreateUserDto, studentDto: Omit<CreateStudentDto, 'userId'>, parentDto?: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    linkUser(dto: CreateStudentDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAllWithParentIds(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateStudentDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
