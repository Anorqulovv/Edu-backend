import { ParentsService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { CreateUserDto } from "../users/dto/create-user.dto";
export declare class ParentsController {
    private readonly parentsService;
    constructor(parentsService: ParentsService);
    create(userDto: CreateUserDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    linkUser(dto: CreateParentDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getMyChildren(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateParentDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
