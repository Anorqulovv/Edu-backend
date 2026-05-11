import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Attendance } from "src/databases/entities/attendance.entity";
import { Student } from "src/databases/entities/student.entity";
import { Group } from "src/databases/entities/group.entity";
import { TelegramService } from "../telegram/telegram.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { succesRes } from "src/infrastructure/utils/succes-res";
import { UserRole } from "src/common/enums/role.enum";

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private readonly attRepo: Repository<Attendance>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    private readonly telegramService: TelegramService,
  ) {}

  // ==================== TURNSTILE (karta) ====================
  async handleTurnstile(cardId: string) {
    const student = await this.studentRepo.findOne({
      where: { cardId },
      relations: ['user', 'parent', 'parent.user'],
    });
    if (!student) throw new NotFoundException('Karta egasi topilmadi');

    const attendance = this.attRepo.create({
      studentId: student.id,
      isPresent: true,
      type: 'TURNSTILE',
      timestamp: new Date(),
    });
    await this.attRepo.save(attendance);

    const parentTelegramId = student.parent?.user?.telegramId;
    if (parentTelegramId) {
      const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const message =
        `🔔 <b>Davomat xabarnomasi</b>\n\n` +
        `Farzandingiz <b>${student.user.fullName}</b> markazga keldi.\n` +
        `🕒 Vaqt: <b>${time}</b>`;
      await this.telegramService.sendNotification(parentTelegramId, message);
    }

    return succesRes({ message: 'Davomat saqlandi', student: student.user.fullName });
  }

  // ==================== QO'LDA DAVOMAT (ustoz) ====================
  async createByTeacher(dto: CreateAttendanceDto, reqUser: any) {
    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId },
      relations: ['user', 'parent', 'parent.user', 'group'],
    });
    if (!student) throw new NotFoundException(`O'quvchi ID ${dto.studentId} topilmadi`);

    // Ustoz faqat o'z guruhidagi o'quvchilar uchun davomat qila oladi
    if (reqUser.role === UserRole.TEACHER) {
      const group = await this.groupRepo.findOne({
        where: { id: student.groupId, teacherId: reqUser.id },
      });
      if (!group) {
        throw new ForbiddenException("Siz faqat o'z guruhingiz o'quvchilari uchun davomat qila olasiz");
      }
    }

    const attendance = this.attRepo.create({
      studentId: dto.studentId,
      isPresent: dto.isPresent ?? true,
      type: dto.type ?? 'MANUAL',
      timestamp: new Date(),
    });
    await this.attRepo.save(attendance);

    // Ota-onaga TG xabar
    await this._notifyParent(student, dto.isPresent ?? true);

    return succesRes({ message: 'Davomat saqlandi', attendance });
  }

  // ==================== GURUH BO'YICHA TOPLU YO'QLAMA ====================
  async markGroupAttendance(
    groupId: number,
    attendances: { studentId: number; isPresent: boolean }[],
    reqUser: any,
  ) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['students', 'students.user', 'students.parent', 'students.parent.user'],
    });
    if (!group) throw new NotFoundException(`Guruh ID ${groupId} topilmadi`);

    // Ustoz faqat o'z guruhini boshqaradi
    if (reqUser.role === UserRole.TEACHER && group.teacherId !== reqUser.id) {
      throw new ForbiddenException("Siz faqat o'z guruhingiz yo'qlamasini qila olasiz");
    }

    const results: any[] = [];
    for (const item of attendances) {
      const student = group.students?.find((s) => s.id === item.studentId);
      if (!student) continue;

      const att = this.attRepo.create({
        studentId: item.studentId,
        isPresent: item.isPresent,
        type: 'MANUAL',
        timestamp: new Date(),
      });
      await this.attRepo.save(att);
      results.push(att);

      // Ota-onaga xabar
      await this._notifyParent(student, item.isPresent);
    }

    return succesRes({
      message: `${results.length} ta o'quvchi yo'qlamasi saqlandi`,
      group: group.name,
      attendances: results,
    });
  }

  // ==================== GURUH DAVOMATINI KO'RISH ====================
  async getGroupAttendance(groupId: number, reqUser: any) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Guruh topilmadi`);

    if (reqUser.role === UserRole.TEACHER && group.teacherId !== reqUser.id) {
      throw new ForbiddenException("Siz faqat o'z guruhingiz davomatini ko'ra olasiz");
    }

    const students = await this.studentRepo.find({
      where: { groupId },
      relations: ['user'],
    });

    const result = await Promise.all(
      students.map(async (s) => {
        const records = await this.attRepo.find({
          where: { studentId: s.id },
          order: { timestamp: 'DESC' },
          take: 30,
        });
        return {
          studentId: s.id,
          fullName: s.user?.fullName,
          attendance: records,
        };
      }),
    );

    return succesRes(result);
  }

  // ==================== BARCHA DAVOMATLAR ====================
  async findAll() {
    const data = await this.attRepo.find({
      relations: ['student', 'student.user'],
      order: { timestamp: 'DESC' },
    });
    return succesRes(data);
  }

  // ==================== O'QUVCHI O'Z DAVOMATI ====================
  async findByStudentUserId(userId: number) {
    const student = await this.studentRepo.findOne({ where: { userId } });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    const data = await this.attRepo.find({
      where: { studentId: student.id },
      order: { timestamp: 'DESC' },
    });
    return succesRes(data);
  }

  // ==================== ID BO'YICHA ====================
  async findOne(id: number) {
    const att = await this.attRepo.findOne({
      where: { id },
      relations: ['student', 'student.user'],
    });
    if (!att) throw new NotFoundException(`Davomat ID ${id} topilmadi`);
    return succesRes(att);
  }

  // ==================== PRIVATE: OTA-ONAGA XABAR ====================
  private async _notifyParent(student: Student, isPresent: boolean) {
    try {
      const parentTelegramId = (student as any).parent?.user?.telegramId;
      if (!parentTelegramId) return;

      const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const name = (student as any).user?.fullName ?? 'O\'quvchi';

      const message = isPresent
        ? `✅ <b>Davomat xabarnomasi</b>\n\nFarzandingiz <b>${name}</b> bugun darsga <b>keldi</b>.\n🕒 Vaqt: <b>${time}</b>`
        : `⚠️ <b>Davomat xabarnomasi</b>\n\nFarzandingiz <b>${name}</b> bugun darsga <b>kelmadi</b>.\n🕒 Vaqt: <b>${time}</b>`;

      await this.telegramService.sendNotification(parentTelegramId, message);
    } catch (e) {
      console.error('_notifyParent error:', e);
    }
  }
}
