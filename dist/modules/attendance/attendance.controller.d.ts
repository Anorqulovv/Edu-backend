import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    handleTurnstile(cardId: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    create(dto: CreateAttendanceDto, req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    markGroupAttendance(groupId: number, body: {
        attendances: {
            studentId: number;
            isPresent: boolean;
        }[];
    }, req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getMyAttendance(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getGroupAttendance(groupId: number, req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
