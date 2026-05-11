import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Test } from '../../databases/entities/test.entity';
import { TestResult } from '../../databases/entities/test-result.entity';
import { Student } from '../../databases/entities/student.entity';
import { Parent } from '../../databases/entities/parent.entity';

import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';

import { TelegramService } from '../telegram/telegram.service';
import { succesRes } from '../../infrastructure/utils/succes-res';
import { ISucces } from '../../infrastructure/utils/succes-interface';
import { UserRole } from '../../common/enums/role.enum';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestResult) private resultRepo: Repository<TestResult>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    private readonly telegramService: TelegramService,
  ) { }

  async create(dto: CreateTestDto, currentUser?: any): Promise<ISucces> {
    if (currentUser?.role === UserRole.TEACHER) {
      if (dto.groupId) {
        const teacherGroup = await this.testRepo.manager
          .getRepository('groups')
          .findOne({ where: { id: dto.groupId, teacherId: currentUser.id } });
        if (!teacherGroup) {
          throw new ForbiddenException("Siz faqat o'z guruhlaringizga test yarata olasiz");
        }
      }
      if (dto.directionId) {
        throw new ForbiddenException("Ustoz yo'nalish bo'yicha test yarata olmaydi. Faqat guruh yoki umumiy test yarating");
      }
    }

    const test = this.testRepo.create(dto);
    const saved = await this.testRepo.save(test);
    return succesRes(saved, 201);
  }

  async findAll(currentUser: any): Promise<ISucces> {
    if (currentUser.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findOne({
        where: { userId: currentUser.id },
        relations: ['group'],
      });

      if (!student) return succesRes([]);

      const conditions: any[] = [];
      if (student.groupId) conditions.push({ groupId: student.groupId });
      if (student.group?.directionId) {
        conditions.push({ directionId: student.group.directionId, groupId: null });
      }
      conditions.push({ groupId: null, directionId: null });

      const data = await this.testRepo.find({
        where: conditions,
        order: { id: 'DESC' },
        relations: ['direction', 'group'],
      });

      return succesRes(data);
    }

    if ([UserRole.TEACHER, UserRole.SUPPORT].includes(currentUser.role)) {
      const teacherGroups = await this.testRepo.manager
        .getRepository('groups')
        .find({
          where: { teacherId: currentUser.id },
          select: ['id', 'directionId'],
        });

      const groupIds = teacherGroups.map((g: any) => g.id);
      const directionIds = teacherGroups.map((g: any) => g.directionId).filter(Boolean);

      const conditions: any[] = [];
      if (groupIds.length) conditions.push({ groupId: In(groupIds) });
      if (directionIds.length) {
        conditions.push({ directionId: In(directionIds), groupId: null });
      }
      conditions.push({ directionId: null, groupId: null });

      const data = await this.testRepo.find({
        where: conditions,
        order: { id: 'DESC' },
        relations: ['direction', 'group'],
      });

      return succesRes(data);
    }

    const data = await this.testRepo.find({
      order: { id: 'DESC' },
      relations: ['direction', 'group'],
    });

    return succesRes(data);
  }

  async findOne(id: number, currentUser?: any): Promise<ISucces> {
    const test = await this.testRepo.findOne({
      where: { id },
      relations: {
        questions: { choices: true },
        results: { student: { user: true } },
        direction: true,
        group: true,
      },
      order: { questions: { id: 'ASC' } },
    });

    if (!test) throw new NotFoundException(`Test ID ${id} topilmadi`);

    if (currentUser?.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findOne({
        where: { userId: currentUser.id },
        relations: ['group'],
      });

      if (!student) throw new NotFoundException("O'quvchi topilmadi");

      const isOwnGroupTest = student.groupId != null && test.groupId === student.groupId;
      const isDirectionTest =
        test.directionId != null &&
        test.groupId == null &&
        student.group?.directionId === test.directionId;
      const isGeneral = test.groupId == null && test.directionId == null;

      if (!isOwnGroupTest && !isDirectionTest && !isGeneral) {
        throw new ForbiddenException("Bu test sizning guruhingizga tegishli emas");
      }

      // O'quvchi faqat o'z natijalarini ko'radi — barcha urinishlar bilan
      const myResults = test.results?.filter(r => r.studentId === student.id) ?? [];
      return succesRes({ ...test, results: myResults });
    }

    // Ustoz/Admin: barcha o'quvchilarning barcha urinishlari
    return succesRes(test);
  }

  async update(id: number, dto: UpdateTestDto): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Test ID ${id} topilmadi`);

    await this.testRepo.update(id, dto);
    const updated = await this.testRepo.findOne({
      where: { id },
      relations: ['direction', 'group'],
    });

    return succesRes(updated!);
  }

  async remove(id: number): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id } });
    if (!test) throw new NotFoundException(`Test ID ${id} topilmadi`);

    await this.testRepo.delete(id);
    return succesRes({ message: "Test muvaffaqiyatli o'chirildi" });
  }

  // ==================== RESET (natijani arxivlab qayta ishlashga ruxsat) ====================
  async resetTestAttempt(teacherUserId: number, studentId: number, testId: number): Promise<ISucces> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['group'],
    });
    if (!student) throw new NotFoundException("O'quvchi topilmadi");

    if (student.groupId) {
      const teacherGroup = await this.testRepo.manager
        .getRepository('groups')
        .findOne({ where: { id: student.groupId, teacherId: teacherUserId } });

      if (!teacherGroup) {
        throw new ForbiddenException("Siz faqat o'z guruhingiz o'quvchilariga ruxsat bera olasiz");
      }
    }

    // Joriy faol natijani arxivlaymiz (o'chirmaymiz — tarix saqlanadi)
    const currentResult = await this.resultRepo.findOne({
      where: { testId, studentId, isCurrent: true },
    });

    if (!currentResult) {
      throw new NotFoundException("Bu o'quvchining bu test bo'yicha faol natijasi topilmadi");
    }

    // Urinishlar sonini hisoblaymiz
    const attemptCount = await this.resultRepo.count({ where: { testId, studentId } });

    // Eski natijani arxivlaymiz
    await this.resultRepo.update(currentResult.id, { isCurrent: false });

    return succesRes({
      message: `O'quvchi ID ${studentId} uchun test ID ${testId} natijasi arxivlandi. Endi ${attemptCount + 1}-urinish uchun ishlashi mumkin.`,
      archivedAttempt: attemptCount,
    });
  }

  // ==================== O'QUVCHI NATIJALAR TARIXI ====================
  async getStudentTestHistory(studentId: number): Promise<ISucces> {
    const results = await this.resultRepo.find({
      where: { studentId },
      relations: ['test'],
      order: { createdAt: 'DESC' },
    });
    return succesRes(results);
  }

  async addScore(dto: AddScoreDto): Promise<ISucces> {
    const test = await this.testRepo.findOne({ where: { id: dto.testId } });
    if (!test) throw new NotFoundException('Test topilmadi');

    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId },
      relations: ['user', 'parent', 'parent.user'],
    });

    if (!student) throw new NotFoundException("O'quvchi topilmadi");

    // Agar faol natija bo'lsa arxivlaymiz
    const existing = await this.resultRepo.findOne({
      where: { testId: dto.testId, studentId: dto.studentId, isCurrent: true },
    });
    const attemptCount = await this.resultRepo.count({ where: { testId: dto.testId, studentId: dto.studentId } });
    if (existing) {
      await this.resultRepo.update(existing.id, { isCurrent: false });
    }

    const result = this.resultRepo.create({
      testId: dto.testId,
      studentId: dto.studentId,
      score: dto.score,
      attempt: attemptCount + 1,
      isCurrent: true,
    });

    const savedResult = await this.resultRepo.save(result);

    const minScore = test.minScore ?? 60;
    const passed = dto.score >= minScore;

    if (student.user?.telegramId) {
      const msg =
        `📊 <b>Test natijasi</b>\n\n` +
        `📝 Test: <b>${test.title}</b>\n` +
        `🎯 Ballingiz: <b>${dto.score}</b>/100\n` +
        `📉 Min ball: ${minScore}\n` +
        `${passed ? "✅ O'tdingiz!" : "❌ O'tmadingiz"}`;

      await this.telegramService.sendNotification(student.user.telegramId, msg);
    }

    if (!passed && student.parent?.user?.telegramId) {
      const parentMsg =
        `⚠️ <b>Hurmatli ota-ona!</b>\n\n` +
        `👤 O'quvchi: <b>${student.user?.fullName}</b>\n` +
        `📝 Test: <b>${test.title}</b>\n` +
        `❌ Ball: <b>${dto.score}</b>/100 (min: ${minScore})\n\n` +
        `Iltimos, farzandingiz bilan suhbatlashib ko'ring.`;

      await this.telegramService.sendNotification(student.parent.user.telegramId, parentMsg);
    }

    return succesRes(savedResult);
  }

  async submitTest(userId: number, testId: number, answers: Record<number, number>): Promise<ISucces> {
    const student = await this.studentRepo.findOne({
      where: { userId },
      relations: ['user', 'parent', 'parent.user', 'group'],
    });

    if (!student) throw new NotFoundException("O'quvchi topilmadi");

    const test = await this.testRepo.findOne({
      where: { id: testId },
      relations: { questions: { choices: true } },
    });

    if (!test) throw new NotFoundException('Test topilmadi');

    // Faol natija bormi? (bir marta ishlash qoidasi)
    const existingResult = await this.resultRepo.findOne({
      where: { testId, studentId: student.id, isCurrent: true },
    });

    if (existingResult) {
      throw new ForbiddenException(
        "Siz bu testni allaqachon ishlagansiz. Qayta ishlash uchun ustoz ruxsati kerak.",
      );
    }

    const isOwnGroupTest = student.groupId != null && test.groupId === student.groupId;
    const isDirectionTest =
      test.directionId != null &&
      test.groupId == null &&
      student.group?.directionId === test.directionId;
    const isGeneral = test.groupId == null && test.directionId == null;

    if (!isOwnGroupTest && !isDirectionTest && !isGeneral) {
      throw new ForbiddenException("Bu test sizning guruhingizga tegishli emas");
    }

    let correctCount = 0;
    const totalQuestions = test.questions.length;

    for (const question of test.questions) {
      const selectedChoiceId = answers[question.id];
      if (!selectedChoiceId) continue;

      const correctChoice = question.choices.find(c => c.isCorrect === true);
      if (correctChoice && correctChoice.id === selectedChoiceId) {
        correctCount++;
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const minScore = test.minScore ?? 60;
    const passed = score >= minScore;

    // Urinish raqamini hisoblash (arxivlar ham bor bo'lishi mumkin)
    const previousAttempts = await this.resultRepo.count({ where: { testId, studentId: student.id } });

    const result = this.resultRepo.create({
      testId,
      studentId: student.id,
      score,
      attempt: previousAttempts + 1,
      isCurrent: true,
    });

    await this.resultRepo.save(result);

    if (student.user?.telegramId) {
      const msg =
        `🧪 <b>Test natijasi</b>\n\n` +
        `📝 Test: <b>${test.title}</b>\n` +
        `🎯 Sizning ballingiz: <b>${score}</b>/100\n` +
        `📉 Minimal ball: ${minScore}\n` +
        `🔢 Urinish: ${previousAttempts + 1}-chi\n` +
        `${passed ? "✅ Tabriklaymiz! O'tdingiz 🎉" : "❌ Afsus, o'tmadingiz"}`;

      await this.telegramService.sendNotification(student.user.telegramId, msg);
    }

    if (student.parent?.user?.telegramId) {
      const parentMsg =
        `⚠️ <b>Hurmatli ota-ona!</b>\n\n` +
        `👤 O'quvchi: <b>${student.user?.fullName}</b>\n` +
        `📝 Test: <b>${test.title}</b>\n` +
        `🎯 Ball: <b>${score}</b>/100 (min: ${minScore})\n` +
        `🔢 Urinish: ${previousAttempts + 1}-chi\n` +
        `${passed ? "✅ O'tdi" : "❌ O'tmadi"}\n\n` +
        `Iltimos, farzandingiz bilan natijani muhokama qiling.`;

      await this.telegramService.sendNotification(student.parent.user.telegramId, parentMsg);
    }

    return succesRes({
      testId,
      studentId: student.id,
      score,
      passed,
      attempt: previousAttempts + 1,
      message: "Test muvaffaqiyatli topshirildi. Natijalar o'quvchi va ota-onaga yuborildi.",
    });
  }
}
