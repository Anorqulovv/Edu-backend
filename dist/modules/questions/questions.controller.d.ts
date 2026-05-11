import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { TestType } from "../../common/enums/test.enum";
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(dto: CreateQuestionDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(testId?: number, type?: TestType): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findDaily(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findWeekly(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findMonthly(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateQuestionDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
