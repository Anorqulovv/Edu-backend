import { UserRole } from "../../../common/enums/role.enum";
export declare class CreateUserDto {
    fullName: string;
    username: string;
    phone: string;
    password: string;
    telegramId?: string;
    directionId?: number;
    directionIds?: number[];
    branchId?: number;
    role?: UserRole;
}
