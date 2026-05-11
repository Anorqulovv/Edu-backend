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

  // ==================== O'QITUVCHI BAND TEKSHIRUVI ====================
  /**
   * Agar o'qituvchi berilgan lessonDays va lessonTime bilan boshqa guruhga
   * tayinlangan bo'lsa, ConflictException qaytaradi.
   * excludeGroupId — yangilashda o'zini istisno qilish uchun
   */
  private async checkTeacherAvailability(
    teacherId: number,
    lessonDays?: string[],
    lessonTime?: string,
    excludeGroupId?: number,
  ): Promise<void> {
    if (!teacherId || !lessonDays || lessonDays.length === 0 || !lessonTime) return;

    const existingGroups = await this.groupRepo.find({
      where: {
        teacherId,
        status: GroupStatus.ACTIVE,
        ...(excludeGroupId ? { id: Not(excludeGroupId) } : {}),
      },
    });

    for (const group of existingGroups) {
      if (!group.lessonTime || !group.lessonDays) continue;

      // Dars kunlari kesishishini tekshir
      const overlappingDays = (group.lessonDays as any as string[]).filter(
        (day: string) => lessonDays.includes(day),
      );

      if (overlappingDays.length > 0 && group.lessonTime === lessonTime) {
        throw new BadRequestException(
          `O'qituvchi "${group.name}" guruhida ${overlappingDays.join(', ')} kuni soat ${lessonTime} da band. Boshqa vaqt yoki o'qituvchi tanlang.`,
        );
      }
    }
  }

  // ==================== CREATE ====================
  async create(dto: CreateGroupDto): Promise<ISucces> {
    await this.checkTeacherAvailability(dto.teacherId, dto.lessonDays, dto.lessonTime);
    return super.create(dto);
  }

  // ==================== UPDATE ====================
  async update(id: number, dto: UpdateGroupDto): Promise<ISucces> {
    const existing = await this.groupRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Guruh topilmadi');

    const teacherId = dto.teacherId ?? existing.teacherId;
    const lessonDays = dto.lessonDays ?? existing.lessonDays as any;
    const lessonTime = dto.lessonTime ?? existing.lessonTime;

    await this.checkTeacherAvailability(teacherId, lessonDays, lessonTime, id);

    return super.update(id, dto);
  }

  // ==================== FIND ALL ====================
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

  // ==================== GURUH KO'RSATKICHI ====================
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

    // Test natijalari
    let totalScore = 0;
    let testCount = 0;
    students.forEach((s: any) => {
      (s.results ?? []).forEach((r: any) => {
        totalScore += r.score ?? 0;
        testCount++;
      });
    });
    const avgScore = testCount > 0 ? Math.round(totalScore / testCount) : 0;

    // Davomat
    let presentCount = 0;
    let attTotal = 0;
    students.forEach((s: any) => {
      (s.attendance ?? []).forEach((a: any) => {
        attTotal++;
        if (a.isPresent) presentCount++;
      });
    });
    const attendanceRate = attTotal > 0 ? Math.round((presentCount / attTotal) * 100) : 0;

    // Umumiy ko'rsatkich (50% test + 50% davomat)
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
