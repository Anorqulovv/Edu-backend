import { BaseEntity } from './Base.entity';
import { User } from './user.entity';
export declare class Branch extends BaseEntity {
    name: string;
    address?: string;
    phone?: string;
    users: User[];
}
