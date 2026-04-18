import { UserRole } from '../../common/enums/role.enum';
import { BaseEntity } from './Base.entity';
export declare class User extends BaseEntity {
    phone: string;
    username: string;
    password: string;
    role: UserRole;
    telegramId: string;
    fullName: string;
}
