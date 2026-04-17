import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseService } from "src/infrastructure/utils/BaseService";
import { Attendance } from "src/databases/entities/attendance.entity";
import { Student } from "src/databases/entities/student.entity";
import { TelegramService } from "../telegram/telegram.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";

@Injectable()
export class AttendanceService extends BaseService<CreateAttendanceDto, UpdateAttendanceDto, Attendance> {
  constructor(
    @InjectRepository(Attendance) private readonly attRepo: Repository<Attendance>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    private readonly telegramService: TelegramService,
  ) {
    super(attRepo);
  }

  async handleTurnstile(cardId: string) {
    const student = await this.studentRepo.findOne({ 
      where: { cardId }, 
      relations: ['user', 'parent', 'parent.user'] 
    });

    if (!student) throw new NotFoundException('Karta egasi topilmadi');

    const attendance = this.attRepo.create({
      studentId: student.id,
      isPresent: true,
      type: 'TURNSTILE',
      timestamp: new Date()
    });
    await this.attRepo.save(attendance);

    const parentTelegramId = student.parent?.user?.telegramId;
    if (parentTelegramId) {
      const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const message = `🔔 <b>Davomat xabarnomasi</b>\n\n` +
        `Farzandingiz <b>${student.user.fullName}</b> markazga keldi.\n` +
        `🕒 Vaqt: <b>${time}</b>`;

      await this.telegramService.sendNotification(parentTelegramId, message);
    }

    return { success: true, student: student.user.fullName };
  }
}