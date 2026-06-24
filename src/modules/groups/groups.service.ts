import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Group } from 'src/databases/entities/group.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';
import { BaseService } from 'src/infrastructure/utils/BaseService';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService extends BaseService<CreateGroupDto, UpdateGroupDto, Group> {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {
    super(groupRepo);
  }

  private normalizeDate(date?: string | null): Date | null {
    if (!date) return null;
    const d = new Date(`${date}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private todayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private timeToMinutes(time?: string | null): number | null {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  private hasDateOverlap(
    aStart?: string | null,
    aEnd?: string | null,
    bStart?: string | null,
    bEnd?: string | null,
  ): boolean {
    const startA = this.normalizeDate(aStart) ?? new Date('1970-01-01T00:00:00');
    const endA = this.normalizeDate(aEnd) ?? new Date('2999-12-31T00:00:00');
    const startB = this.normalizeDate(bStart) ?? new Date('1970-01-01T00:00:00');
    const endB = this.normalizeDate(bEnd) ?? new Date('2999-12-31T00:00:00');

    return startA <= endB && startB <= endA;
  }

  private hasTimeOverlap(
    timeA?: string | null,
    durationA?: number | null,
    timeB?: string | null,
    durationB?: number | null,
  ): boolean {
    const startA = this.timeToMinutes(timeA);
    const startB = this.timeToMinutes(timeB);

    if (startA === null || startB === null) return false;

    const endA = startA + Number(durationA || 90);
    const endB = startB + Number(durationB || 90);

    return startA < endB && startB < endA;
  }

  private validateGroupDates(startDate?: string | null, endDate?: string | null) {
    const today = this.todayStart();
    const start = this.normalizeDate(startDate);
    const end = this.normalizeDate(endDate);

    if (start && start < today) {
      throw new BadRequestException("Guruh boshlanish sanasi bugungi kundan oldin bo'lishi mumkin emas");
    }

    if (end && end < today) {
      throw new BadRequestException("Guruh tugash sanasi bugungi kundan oldin bo'lishi mumkin emas");
    }

    if (start && end && end < start) {
      throw new BadRequestException("Guruh tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas");
    }
  }

  private validateLessonDays(lessonDays?: string[] | null) {
    if (!lessonDays?.length) return;

    if (lessonDays.includes('Yakshanba')) {
      throw new BadRequestException("Yakshanba kuni dars qo'yib bo'lmaydi");
    }
  }

  private async checkUserAvailability(params: {
    userId?: number | null;
    roleName: "O'qituvchi" | "Support";
    field: 'teacherId' | 'supportId';
    lessonDays?: string[] | null;
    lessonTime?: string | null;
    lessonDuration?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    excludeGroupId?: number;
  }): Promise<void> {
    const {
      userId,
      roleName,
      field,
      lessonDays,
      lessonTime,
      lessonDuration,
      startDate,
      endDate,
      excludeGroupId,
    } = params;

    if (!userId || !lessonDays?.length || !lessonTime) return;

    const existingGroups = await this.groupRepo.find({
      where: {
        [field]: userId,
        status: GroupStatus.ACTIVE,
        ...(excludeGroupId ? { id: Not(excludeGroupId) } : {}),
      } as any,
    });

    for (const group of existingGroups) {
      if (!group.lessonTime || !group.lessonDays?.length) continue;

      const overlappingDays = (group.lessonDays as string[]).filter((day) =>
        lessonDays.includes(day),
      );

      if (!overlappingDays.length) continue;

      const dateOverlap = this.hasDateOverlap(
        startDate,
        endDate,
        group.startDate,
        group.endDate,
      );

      if (!dateOverlap) continue;

      const timeOverlap = this.hasTimeOverlap(
        lessonTime,
        lessonDuration,
        group.lessonTime,
        group.lessonDuration,
      );

      if (timeOverlap) {
        throw new BadRequestException(
          `${roleName} band: "${group.name}" guruhida ${overlappingDays.join(', ')} kuni ${group.lessonTime} da darsi bor. Boshqa vaqt yoki boshqa ${roleName.toLowerCase()} tanlang.`,
        );
      }
    }
  }

  async create(dto: CreateGroupDto): Promise<ISucces> {
    this.validateGroupDates(dto.startDate, dto.endDate);
    this.validateLessonDays(dto.lessonDays);

    await this.checkUserAvailability({
      userId: dto.teacherId,
      roleName: "O'qituvchi",
      field: 'teacherId',
      lessonDays: dto.lessonDays,
      lessonTime: dto.lessonTime,
      lessonDuration: dto.lessonDuration,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    await this.checkUserAvailability({
      userId: dto.supportId,
      roleName: "Support",
      field: 'supportId',
      lessonDays: dto.lessonDays,
      lessonTime: dto.lessonTime,
      lessonDuration: dto.lessonDuration,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return super.create(dto);
  }

  async update(id: number, dto: UpdateGroupDto): Promise<ISucces> {
    const existing = await this.groupRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Guruh topilmadi');

    const teacherId = dto.teacherId ?? existing.teacherId;
    const supportId = dto.supportId ?? existing.supportId;
    const lessonDays = (dto.lessonDays ?? existing.lessonDays) as any;
    const lessonTime = dto.lessonTime ?? existing.lessonTime;
    const lessonDuration = dto.lessonDuration ?? existing.lessonDuration;
    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    // Update paytida eski startDate oldin bo'lishi mumkin.
    // Agar user startDate/endDate ni o'zgartirmasa, faqat date tartibini tekshiramiz.
    const startDateChanged =
      dto.startDate !== undefined && dto.startDate !== existing.startDate;

    const endDateChanged =
      dto.endDate !== undefined && dto.endDate !== existing.endDate;

    if (startDateChanged || endDateChanged) {
      this.validateGroupDates(startDate, endDate);
    } else {
      const start = this.normalizeDate(startDate);
      const end = this.normalizeDate(endDate);

      if (start && end && end < start) {
        throw new BadRequestException("Guruh tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas");
      }
    }

    this.validateLessonDays(lessonDays);

    await this.checkUserAvailability({
      userId: teacherId,
      roleName: "O'qituvchi",
      field: 'teacherId',
      lessonDays,
      lessonTime,
      lessonDuration,
      startDate,
      endDate,
      excludeGroupId: id,
    });

    await this.checkUserAvailability({
      userId: supportId,
      roleName: "Support",
      field: 'supportId',
      lessonDays,
      lessonTime,
      lessonDuration,
      startDate,
      endDate,
      excludeGroupId: id,
    });

    return super.update(id, dto);
  }

  async findAll(currentUser: any, query?: any): Promise<ISucces> {
    const where: any = {};

    if (query?.name) where.name = ILike(`%${query.name}%`);
    if (query?.teacherId) where.teacherId = Number(query.teacherId);
    if (query?.directionId) where.directionId = Number(query.directionId);
    if (query?.branchId) where.branchId = Number(query.branchId);

    let baseWhere: any;

    if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(currentUser.role)) {
      baseWhere = where;
    } else if (currentUser.role === UserRole.SUPPORT) {
      baseWhere = { ...where, directionId: currentUser.directionId };
    } else {
      baseWhere = { ...where, teacherId: currentUser.id };
    }

    const groups = await this.groupRepo.find({
      where: baseWhere,
      relations: ['teacher', 'direction', 'students'],
    });

    return succesRes(groups);
  }

  async findOneWithStudents(id: number): Promise<ISucces> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['teacher', 'direction', 'students', 'students.user', 'support'],
    });

    if (!group) throw new NotFoundException('Group topilmadi');
    return succesRes(group);
  }

  async updateStatus(id: number, status: GroupStatus): Promise<ISucces> {
    await this.groupRepo.update(id, { status });
    return succesRes({ message: 'Guruh holati yangilandi' });
  }

  async getGroupScore(id: number): Promise<ISucces> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: [
        'students',
        'students.results',
        'students.attendance',
        'students.user',
      ],
    });

    if (!group) throw new NotFoundException('Group topilmadi');

    const students = group.students ?? [];
    const total = students.length;

    let totalScore = 0;
    let testCount = 0;

    students.forEach((s: any) => {
      (s.results ?? []).forEach((r: any) => {
        totalScore += r.score ?? 0;
        testCount++;
      });
    });

    const avgScore = testCount > 0 ? Math.round(totalScore / testCount) : 0;

    let presentCount = 0;
    let attTotal = 0;

    students.forEach((s: any) => {
      (s.attendance ?? []).forEach((a: any) => {
        attTotal++;
        if (a.isPresent) presentCount++;
      });
    });

    const attendanceRate = attTotal > 0 ? Math.round((presentCount / attTotal) * 100) : 0;
    const overallScore = Math.round((avgScore + attendanceRate) / 2);

    const grade =
      overallScore >= 90 ? 'A' :
      overallScore >= 75 ? 'B' :
      overallScore >= 60 ? 'C' :
      overallScore >= 45 ? 'D' : 'F';

    return succesRes({
      groupId: id,
      groupName: group.name,
      totalStudents: total,
      avgTestScore: avgScore,
      attendanceRate,
      overallScore,
      grade,
    });
  }
}
