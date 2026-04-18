import { UsersService } from './users.service';
import { UserRole } from "../../common/enums/role.enum";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
