import { Repository } from 'typeorm';
import { Group } from "../../databases/entities/group.entity";
import { GroupStatus } from "../../common/enums/groupStatus.enum";
import { ISucces } from "../../infrastructure/utils/succes-interface";
import { BaseService } from "../../infrastructure/utils/BaseService";
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsService extends BaseService<CreateGroupDto, UpdateGroupDto, Group> {
    private readonly groupRepo;
    constructor(groupRepo: Repository<Group>);
    findAll(currentUser: any): Promise<ISucces>;
    findOneWithStudents(id: number): Promise<ISucces>;
    updateStatus(id: number, status: GroupStatus): Promise<ISucces>;
}
