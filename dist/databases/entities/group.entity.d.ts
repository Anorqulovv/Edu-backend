import { Student } from './student.entity';
import { User } from './user.entity';
import { BaseEntity } from './Base.entity';
import { GroupStatus } from "../../common/enums/groupStatus.enum";
import { Direction } from './direction.entity';
export declare class Group extends BaseEntity {
    name: string;
    status: GroupStatus;
    teacherId: number;
    teacher: User;
    directionId?: number;
    direction: Direction;
    students: Student[];
    startDate: string;
    endDate: string;
    support?: User;
    supportId?: number;
    lessonDays?: string[];
    lessonTime?: string;
    lessonDuration?: number;
    branchId?: number;
}
