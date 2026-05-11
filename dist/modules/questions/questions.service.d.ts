import { Repository } from 'typeorm';
import { Question } from "../../databases/entities/question.entity";
import { Choice } from "../../databases/entities/choice.entity";
import { Test } from "../../databases/entities/test.entity";
import { TestType } from "../../common/enums/test.enum";
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class QuestionsService {
    private questionRepo;
    private choiceRepo;
    private testRepo;
    constructor(questionRepo: Repository<Question>, choiceRepo: Repository<Choice>, testRepo: Repository<Test>);
    create(dto: CreateQuestionDto): Promise<ISucces>;
    findAll(testId?: number, type?: TestType): Promise<ISucces>;
    findByType(type: TestType): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateQuestionDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
}
