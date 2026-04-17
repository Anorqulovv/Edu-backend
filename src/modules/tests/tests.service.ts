import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from 'src/databases/entities/test.entity';
import { TestResult } from 'src/databases/entities/test-result.entity';
import { Student } from 'src/databases/entities/student.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestResult) private resultRepo: Repository<TestResult>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
  ) {}

  async create(dto: CreateTestDto): Promise<ISucces> {
    const test = this.testRepo.create(dto);
    const saved = await this.testRepo.save(test);
    return succesRes(saved, 201);
  }

  async findAll() {
    const data = await this.testRepo.find({ order: { createdAt: 'DESC' } });
    return succesRes(data);
  }

  async findOne(id: number) {
    const data = await this.testRepo.findOne({ where: { id } });
    if (!data) throw new NotFoundException(`Test ID ${id} topilmadi`);
    return succesRes(data);
  }

  async update(id: number, dto: UpdateTestDto): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Test ID ${id} topilmadi`);

    await this.testRepo.update(id, dto);
    const updated = await this.testRepo.findOne({ where: { id } });
    return succesRes(updated!);
  }

  async remove(id: number): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Test ID ${id} topilmadi`);

    await this.testRepo.delete(id);
    return succesRes({ message: 'Test o‘chirildi' });
  }

  async addScore(dto: AddScoreDto): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id: dto.testId } });
    if (!test) throw new NotFoundException('Test topilmadi');

    const student = await this.studentRepo.findOne({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('O‘quvchi topilmadi');

    const result = this.resultRepo.create({
      testId: dto.testId,
      studentId: dto.studentId,
      score: dto.score,
    });

    const savedResult = await this.resultRepo.save(result);
    return succesRes(savedResult);
  }
}