import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(dto: CreateGroupDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(req: any, query: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getDetails(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateGroupDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    updateStatus(id: number, status: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getGroupScore(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
