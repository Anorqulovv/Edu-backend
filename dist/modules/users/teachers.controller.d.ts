import { UsersService } from './users.service';
import { TeachersService } from './teachers.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class TeachersController {
    private readonly usersService;
    private readonly teachersService;
    constructor(usersService: UsersService, teachersService: TeachersService);
    create(dto: CreateUserDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getMyGroups(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateUserDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
