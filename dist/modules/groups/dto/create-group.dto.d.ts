import { GroupStatus } from "../../../common/enums/groupStatus.enum";
export declare class CreateGroupDto {
    name: string;
    status: GroupStatus;
    teacherId: number;
    directionId?: number;
    startDate?: string;
    endDate?: string;
    supportId?: number;
    lessonDays?: string[];
    lessonTime?: string;
    lessonDuration?: number;
    branchId?: number;
}
