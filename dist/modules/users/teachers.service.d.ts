import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Group } from "../../databases/entities/group.entity";
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class TeachersService {
    private readonly usersService;
    private readonly groupRepo;
    constructor(usersService: UsersService, groupRepo: Repository<Group>);
    getMyGroups(teacherId: number): Promise<ISucces>;
    update(id: number, dto: UpdateUserDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
