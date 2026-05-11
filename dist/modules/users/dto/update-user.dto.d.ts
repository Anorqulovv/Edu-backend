import { UserRole } from "../../../common/enums/role.enum";
export declare class UpdateUserDto {
    fullName?: string;
    username?: string;
    phone?: string;
    password?: string;
    isActive?: boolean;
    telegramId?: string;
    directionId?: number;
    directionIds?: number[];
    branchId?: number;
    role?: UserRole;
    avatar?: string;
}
