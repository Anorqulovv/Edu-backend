import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Test } from '../../databases/entities/test.entity';
import { TestResult } from '../../databases/entities/test-result.entity';
import { Student } from '../../databases/entities/student.entity';
import { Parent } from '../../databases/entities/parent.entity';
import { Question } from '../../databases/entities/question.entity';

import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { GenerateMonthlyTestsDto } from './dto/generate-monthly-tests.dto';
import { CreateBankQuestionDto } from './dto/create-bank-question.dto';
import { AiGenerateTestDto } from './dto/ai-generate-test.dto';
import { envConfig } from '../../common/config';

import { TelegramService } from '../telegram/telegram.service';
import { succesRes } from '../../infrastructure/utils/succes-res';
import { ISucces } from '../../infrastructure/utils/succes-interface';
import { UserRole } from '../../common/enums/role.enum';
import { TestType } from '../../common/enums/test.enum';
import { TestStatus } from '../../common/enums/testStatus.enum';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestResult) private resultRepo: Repository<TestResult>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    private readonly telegramService: TelegramService,
  ) { }



  async aiGenerateTest(dto: AiGenerateTestDto, currentUser?: any): Promise<ISucces> {
    if (!envConfig.AI.AI_TEST_GENERATION_ENABLED) {
      throw new ForbiddenException('AI test generatsiya hozircha o‘chirilgan');
    }

    if (!envConfig.AI.GEMINI_API_KEY) {
      throw new ForbiddenException('GEMINI_API_KEY sozlanmagan');
    }

    if (currentUser?.role === UserRole.TEACHER && dto.groupId) {
      const teacherGroup = await this.testRepo.manager
        .getRepository('groups')
        .findOne({ where: { id: dto.groupId, teacherId: currentUser.id } });

      if (!teacherGroup) {
        throw new ForbiddenException("Siz faqat o'z guruhingiz uchun AI test yarata olasiz");
      }
    }

    const count = dto.count ?? 10;
    const difficulty = dto.difficulty ?? 'medium';

    const prompt = `
Sen ta'lim CRM uchun test tuzuvchi assistantsan.
Faqat valid JSON qaytar. Markdown ishlatma.

Mavzu: ${dto.topic}
Test turi: ${dto.type}
Dars raqami: ${dto.lessonNumber ?? 'berilmagan'}
Qiyinlik: ${difficulty}
Savollar soni: ${count}

JSON format:
{
  "title": "test nomi",
  "type": "${dto.type}",
  "questions": [
    {
      "text": "savol matni",
      "choices": [
        { "text": "variant A", "isCorrect": true },
        { "text": "variant B", "isCorrect": false },
        { "text": "variant C", "isCorrect": false },
        { "text": "variant D", "isCorrect": false }
      ]
    }
  ]
}

Talablar:
- Har savolda kamida 4 ta variant bo'lsin.
- Faqat 1 ta to'g'ri javob bo'lsin.
- Savollar o'zbek tilida bo'lsin.
- Javob JSONdan boshqa hech narsa bo'lmasin.
`;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${envConfig.AI.GEMINI_MODEL}:generateContent?key=${envConfig.AI.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new ForbiddenException(`AI xatolik: ${errText}`);
    }

    const aiData: any = await response.json();
    const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new ForbiddenException('AI javob qaytarmadi');
    }

    let parsed: any;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new ForbiddenException('AI valid JSON qaytarmadi');
      parsed = JSON.parse(match[0]);
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const normalizedQuestions = questions
      .filter((q: any) => q?.text && Array.isArray(q?.choices))
      .map((q: any) => {
        const choices = q.choices
          .filter((c: any) => c?.text)
          .slice(0, 6)
          .map((c: any) => ({
            text: String(c.text),
            isCorrect: Boolean(c.isCorrect),
          }));

        const correctCount = choices.filter((c) => c.isCorrect).length;

        if (correctCount !== 1 && choices.length > 0) {
          choices.forEach((c, index) => {
            c.isCorrect = index === 0;
          });
        }

        return {
          text: String(q.text),
          choices,
        };
      });

    return succesRes({
      title: parsed.title || `${dto.topic} testi`,
      type: dto.type,
      directionId: dto.directionId,
      groupId: dto.groupId,
      lessonNumber: dto.lessonNumber,
      minScore: 60,
      generatedBy: 'AI',
      questions: normalizedQuestions,
    });
  }


  async getParentChildrenAnalytics(currentUser: any): Promise<ISucces> {
    const parent = await this.parentRepo.findOne({
      where: { userId: currentUser.id },
      relations: ['students', 'students.user', 'students.group'],
    });

    if (!parent || !parent.students?.length) {
      return succesRes({
        children: [],
      });
    }

    const children: any[] = [];

    for (const student of parent.students) {
      const results = await this.resultRepo.find({
        where: { studentId: student.id },
        relations: ['test'],
        order: { createdAt: 'ASC' },
      });

      // Barcha urinishlar hisobga olinadi: isCurrent=false bo'lgan arxiv urinishlar ham.
      const scores = results.map((r) => Number(r.score));

      const averageScore = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      const highestScore = scores.length ? Math.max(...scores) : 0;
      const lowestScore = scores.length ? Math.min(...scores) : 0;

      children.push({
        studentId: student.id,
        fullName: student.user?.fullName,
        groupName: student.group?.name,
        totalTests: results.length,
        averageScore,
        highestScore,
        lowestScore,
        tests: results.map((r, index) => ({
          id: r.id,
          testId: r.testId,
          label: `${r.test?.title || `Test ${index + 1}`} (${r.attempt}-urinish)`,
          score: r.score,
          type: r.test?.type,
          date: r.createdAt,
          attempt: r.attempt,
          isCurrent: r.isCurrent,
        })),
      });
    }

    return succesRes({ children });
  }

  async getStudentAnalytics(studentId: number, currentUser?: any): Promise<ISucces> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['user', 'group'],
    });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    if (currentUser?.role === UserRole.TEACHER) {
      const teacherGroup = await this.testRepo.manager
        .getRepository('groups')
        .findOne({ where: { id: student.groupId, teacherId: currentUser.id } });

      if (!teacherGroup) {
        throw new ForbiddenException("Siz faqat o'z guruhingiz o'quvchilarini ko'ra olasiz");
      }
    }

    const results = await this.resultRepo.find({
      where: { studentId },
      relations: ['test'],
      order: { createdAt: 'ASC' },
    });

    // Diagramma va umumiy statistika barcha urinishlar bo'yicha hisoblanadi.
    // isCurrent=false bo'lgan eski urinishlar ham tarixda qoladi va chartda ko'rinadi.
    const allAttempts = results;

    const scores = allAttempts.map((r) => Number(r.score));
    const averageScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const highestScore = scores.length ? Math.max(...scores) : 0;
    const lowestScore = scores.length ? Math.min(...scores) : 0;

    const tests = allAttempts.map((r, index) => ({
      id: r.id,
      testId: r.testId,
      label: `${r.test?.title || `Test ${index + 1}`} (${r.attempt}-urinish)`,
      score: r.score,
      type: r.test?.type,
      date: r.createdAt,
      attempt: r.attempt,
      isCurrent: r.isCurrent,
    }));

    return succesRes({
      studentId: student.id,
      fullName: student.user?.fullName,
      groupId: student.groupId,
      groupName: student.group?.name,
      totalTests: allAttempts.length,
      averageScore,
      highestScore,
      lowestScore,
      tests,
    });
  }

  async createBankQuestion(dto: CreateBankQuestionDto): Promise<ISucces> {
    const question = this.questionRepo.create({
      text: dto.text,
      isBank: true,
      directionId: dto.directionId,
      lessonNumber: dto.lessonNumber,
      type: dto.type,
      choices: dto.choices,
    });

    const saved = await this.questionRepo.save(question);
    return succesRes(saved, 201);
  }

  async getBankQuestions(directionId?: number, lessonNumber?: number, type?: TestType): Promise<ISucces> {
    const where: any = { isBank: true };

    if (directionId) where.directionId = directionId;
    if (lessonNumber) where.lessonNumber = lessonNumber;
    if (type) where.type = type;

    const data = await this.questionRepo.find({
      where,
      relations: ['choices'],
      order: { lessonNumber: 'ASC', id: 'ASC' },
    });

    return succesRes(data);
  }

  private async getQuestionsForGeneratedTest(directionId: number, lesson: number, type: TestType) {
    let lessons: number[] = [lesson];

    if (type === TestType.WEEKLY) {
      lessons = [lesson - 2, lesson - 1, lesson];
    }

    if (type === TestType.MONTHLY) {
      lessons = Array.from({ length: 12 }, (_, index) => index + 1);
    }

    return this.questionRepo.find({
      where: {
        isBank: true,
        directionId,
        lessonNumber: In(lessons),
      },
      relations: ['choices'],
      order: { lessonNumber: 'ASC', id: 'ASC' },
    });
  }

  private cloneBankQuestions(bankQuestions: Question[]) {
    return bankQuestions.map((question) => ({
      text: question.text,
      isBank: false,
      directionId: question.directionId,
      lessonNumber: question.lessonNumber,
      type: question.type,
      choices: question.choices?.map((choice) => ({
        text: choice.text,
        isCorrect: choice.isCorrect,
      })) ?? [],
    }));
  }

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

    const test = this.testRepo.create({
      ...dto,
      status: dto.status ?? TestStatus.ACTIVE,
      isDeleted: false,
    } as any);

    const saved = await this.testRepo.save(test);
    return succesRes(saved, 201);
  }


  async generateMonthlySchedule(dto: GenerateMonthlyTestsDto, currentUser?: any): Promise<ISucces> {
    const monthNumber = dto.monthNumber ?? 1;
    const minScore = dto.minScore ?? 60;
    const titlePrefix = dto.titlePrefix?.trim() || 'Test';

    // Teacher faqat o'z guruhiga test generate qila oladi
    if (currentUser?.role === UserRole.TEACHER) {
      const teacherGroup = await this.testRepo.manager
        .getRepository('groups')
        .findOne({ where: { id: dto.groupId, teacherId: currentUser.id } });

      if (!teacherGroup) {
        throw new ForbiddenException("Siz faqat o'z guruhingizga test yarata olasiz");
      }
    }

    const createdTests: Test[] = [];

    for (let lesson = 1; lesson <= 12; lesson++) {
      // 12 ta kunlik test
      const dailyBankQuestions = await this.getQuestionsForGeneratedTest(dto.directionId, lesson, TestType.DAILY);

      createdTests.push(
        this.testRepo.create({
          title: `${titlePrefix} - ${lesson}-dars kunlik test`,
          type: TestType.DAILY,
          groupId: dto.groupId,
          directionId: dto.directionId,
          lessonNumber: lesson,
          monthNumber,
          minScore,
          questions: this.cloneBankQuestions(dailyBankQuestions) as any,
        }),
      );

      // Har 3 ta darsdan keyin haftalik test
      if (lesson % 3 === 0) {
        const week = lesson / 3;

        const weeklyBankQuestions = await this.getQuestionsForGeneratedTest(dto.directionId, lesson, TestType.WEEKLY);

        createdTests.push(
          this.testRepo.create({
            title: `${titlePrefix} - ${week}-haftalik test`,
            type: TestType.WEEKLY,
            groupId: dto.groupId,
            directionId: dto.directionId,
            lessonNumber: lesson,
            weekNumber: week,
            monthNumber,
            minScore,
            questions: this.cloneBankQuestions(weeklyBankQuestions) as any,
          }),
        );
      }

      // 12-dars kuni oylik test
      if (lesson === 12) {
        const monthlyBankQuestions = await this.getQuestionsForGeneratedTest(dto.directionId, 12, TestType.MONTHLY);

        createdTests.push(
          this.testRepo.create({
            title: `${titlePrefix} - oylik test`,
            type: TestType.MONTHLY,
            groupId: dto.groupId,
            directionId: dto.directionId,
            lessonNumber: 12,
            monthNumber,
            minScore,
            questions: this.cloneBankQuestions(monthlyBankQuestions) as any,
          }),
        );
      }
    }

    const saved = await this.testRepo.save(createdTests);

    return succesRes({
      message: '12 darslik test jadvali yaratildi',
      total: saved.length,
      daily: saved.filter((t) => t.type === TestType.DAILY).length,
      weekly: saved.filter((t) => t.type === TestType.WEEKLY).length,
      monthly: saved.filter((t) => t.type === TestType.MONTHLY).length,
      data: saved,
    }, 201);
  }

  async findAll(currentUser: any): Promise<ISucces> {
    if (currentUser.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findOne({
        where: { userId: currentUser.id },
        relations: ['group'],
      });

      if (!student) return succesRes([]);

      const conditions: any[] = [];
      if (student.groupId) conditions.push({ groupId: student.groupId, status: TestStatus.ACTIVE, isDeleted: false });
      if (student.group?.directionId) {
        conditions.push({ directionId: student.group.directionId, groupId: null, status: TestStatus.ACTIVE, isDeleted: false });
      }
      // Umumiy testlar studentga ko'rsatilmaydi

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
      if (groupIds.length) conditions.push({ groupId: In(groupIds), isDeleted: false });
      if (directionIds.length) {
        conditions.push({ directionId: In(directionIds), groupId: null, isDeleted: false });
      }
      // Umumiy testlar teacher/support uchun ko'rsatilmaydi

      const data = await this.testRepo.find({
        where: conditions,
        order: { id: 'DESC' },
        relations: ['direction', 'group'],
      });

      return succesRes(data);
    }

    const data = await this.testRepo.find({
      where: { isDeleted: false } as any,
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

    await this.testRepo.update(id, { isDeleted: true } as any);

    return succesRes({ message: "Test arxivlandi. Natijalar statistikada saqlanadi." });
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

    if (test.status && test.status !== TestStatus.ACTIVE) {
      throw new ForbiddenException('Bu test faol emas');
    }

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

    if (student.parent?.user?.telegramId) {
      const parentMsg =
        `📊 <b>Farzandingiz test ishladi</b>\n\n` +
        `👤 O'quvchi: <b>${student.user?.fullName}</b>\n` +
        `📝 Test: <b>${test.title}</b>\n` +
        `🎯 Ball: <b>${dto.score}</b>/100 (min: ${minScore})\n` +
        `🔢 Urinish: ${attemptCount + 1}-chi\n` +
        `${passed ? "✅ O'tdi" : "❌ O'tmadi"}\n\n` +
        `${passed ? "Tabriklaymiz!" : "Iltimos, farzandingiz bilan natijani muhokama qiling."}`;

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
