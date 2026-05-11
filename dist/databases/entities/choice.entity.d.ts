import { BaseEntity } from './Base.entity';
import { Question } from './question.entity';
export declare class Choice extends BaseEntity {
    text: string;
    isCorrect: boolean;
    questionId: number;
    question: Question;
}
