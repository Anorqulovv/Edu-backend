import { CreateChoiceDto } from './create-choice.dto';
export declare class CreateQuestionDto {
    text: string;
    testId: number;
    choices: CreateChoiceDto[];
}
