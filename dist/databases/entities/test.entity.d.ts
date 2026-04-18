import { BaseEntity } from './Base.entity';
import { TestResult } from './test-result.entity';
import { TestType } from "../../common/enums/test.enum";
export declare class Test extends BaseEntity {
    title: string;
    type: TestType;
    minScore: number;
    results: TestResult[];
}
