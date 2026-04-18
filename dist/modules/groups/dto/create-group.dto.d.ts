import { GroupStatus } from "../../../common/enums/groupStatus.enum";
export declare class CreateGroupDto {
    name: string;
    status: GroupStatus;
    teacherId: number;
    directionId?: number;
}
