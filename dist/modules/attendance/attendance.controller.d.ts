import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    handleTurnstile(cardId: string): Promise<{
        success: boolean;
        student: string;
    }>;
    create(dto: CreateAttendanceDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
