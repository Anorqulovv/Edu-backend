import { UserRole } from '../../common/enums/role.enum';
import { BaseEntity } from './Base.entity';
import { Direction } from './direction.entity';
import { Branch } from './branch.entity';
export declare class User extends BaseEntity {
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    telegramId: string;
    fullName: string;
    direction: Direction;
    directionId: number;
    directionIds: number[];
    branch: Branch;
    branchId: number;
    avatar: string;
}
