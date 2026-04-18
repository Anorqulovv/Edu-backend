import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
export declare class TestsController {
    private readonly testsService;
    constructor(testsService: TestsService);
    create(dto: CreateTestDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    update(id: number, dto: UpdateTestDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    remove(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    addScore(dto: AddScoreDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
