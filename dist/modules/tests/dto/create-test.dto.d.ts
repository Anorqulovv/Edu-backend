import { TestType } from "../../../common/enums/test.enum";
export declare class CreateTestDto {
    title: string;
    type: TestType;
    minScore?: number;
    directionId?: number;
    groupId?: number;
}
