import { Repository } from 'typeorm';
import { Test } from "../../databases/entities/test.entity";
import { TestResult } from "../../databases/entities/test-result.entity";
import { Student } from "../../databases/entities/student.entity";
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { ISucces } from "../../infrastructure/utils/succes-interface";
export declare class TestsService {
    private testRepo;
    private resultRepo;
    private studentRepo;
    constructor(testRepo: Repository<Test>, resultRepo: Repository<TestResult>, studentRepo: Repository<Student>);
    create(dto: CreateTestDto): Promise<ISucces>;
    findAll(): Promise<ISucces>;
    findOne(id: number): Promise<ISucces>;
    update(id: number, dto: UpdateTestDto): Promise<ISucces>;
    remove(id: number): Promise<ISucces>;
    addScore(dto: AddScoreDto): Promise<ISucces>;
}
