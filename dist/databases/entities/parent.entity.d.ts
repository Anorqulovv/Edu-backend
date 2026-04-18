import { User } from './user.entity';
import { Student } from './student.entity';
import { BaseEntity } from './Base.entity';
export declare class Parent extends BaseEntity {
    userId: number;
    user: User;
    students: Student[];
}
