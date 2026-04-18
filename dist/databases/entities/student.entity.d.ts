import { User } from './user.entity';
import { Parent } from './parent.entity';
import { Group } from '../entities/group.entity';
import { Attendance } from './attendance.entity';
import { TestResult } from '../entities/test-result.entity';
import { BaseEntity } from './Base.entity';
export declare class Student extends BaseEntity {
    cardId: string;
    userId: number;
    user: User;
    parentId?: number;
    parent: Parent;
    groupId?: number;
    group: Group;
    attendance: Attendance[];
    results: TestResult[];
}
