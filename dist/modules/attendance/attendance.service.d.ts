import { Repository } from "typeorm";
import { BaseService } from "../../infrastructure/utils/BaseService";
import { Attendance } from "../../databases/entities/attendance.entity";
import { Student } from "../../databases/entities/student.entity";
import { TelegramService } from "../telegram/telegram.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
export declare class AttendanceService extends BaseService<CreateAttendanceDto, UpdateAttendanceDto, Attendance> {
    private readonly attRepo;
    private readonly studentRepo;
    private readonly telegramService;
    constructor(attRepo: Repository<Attendance>, studentRepo: Repository<Student>, telegramService: TelegramService);
    handleTurnstile(cardId: string): Promise<{
        success: boolean;
        student: string;
    }>;
}
