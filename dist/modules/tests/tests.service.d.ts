import { Repository } from 'typeorm';
import { Test } from '../../databases/entities/test.entity';
import { TestResult } from '../../databases/entities/test-result.entity';
import { Student } from '../../databases/entities/student.entity';
import { Parent } from '../../databases/entities/parent.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { TelegramService } from '../telegram/telegram.service';
import { ISucces } from '../../infrastructure/utils/succes-interface';
export declare class TestsService {
    private testRepo;
    private resultRepo;
    private studentRepo;
    private parentRepo;
    private readonly telegramService;
    constructor(testRepo: Repository<Test>, resultRepo: Repository<TestResult>, studentRepo: Repository<Student>, parentRepo: Repository<Parent>, telegramService: TelegramService);
    create(dto: CreateTestDto, currentUser?: any): Promise<ISucces>;
    findAll(currentUser: any): Promise<ISucces>;
    findOne(id: number, currentUser?: any): Promise<ISucces>;
    update(id: number, dto: UpdateTestDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
    resetTestAttempt(teacherUserId: number, studentId: number, testId: number): Promise<ISucces>;
    getStudentTestHistory(studentId: number): Promise<ISucces>;
    addScore(dto: AddScoreDto): Promise<ISucces>;
    submitTest(userId: number, testId: number, answers: Record<number, number>): Promise<ISucces>;
}
