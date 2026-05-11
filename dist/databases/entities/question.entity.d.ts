import { Test } from './test.entity';
import { Choice } from './choice.entity';
export declare class Question {
    id: number;
    text: string;
    test: Test;
    choices: Choice[];
    testId: number;
}
