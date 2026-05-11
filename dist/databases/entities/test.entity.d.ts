import { Question } from './question.entity';
import { TestResult } from './test-result.entity';
import { TestType } from "../../common/enums/test.enum";
import { Direction } from './direction.entity';
import { Group } from './group.entity';
export declare class Test {
    id: number;
    title: string;
    type: TestType;
    minScore?: number;
    directionId?: number;
    direction: Direction;
    groupId?: number;
    group: Group;
    createdAt: Date;
    questions: Question[];
    results: TestResult[];
}
