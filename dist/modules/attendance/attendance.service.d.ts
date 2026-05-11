import { Repository } from "typeorm";
import { Attendance } from "../../databases/entities/attendance.entity";
import { Student } from "../../databases/entities/student.entity";
import { Group } from "../../databases/entities/group.entity";
import { TelegramService } from "../telegram/telegram.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
export declare class AttendanceService {
    private readonly attRepo;
    private readonly studentRepo;
    private readonly groupRepo;
    private readonly telegramService;
    constructor(attRepo: Repository<Attendance>, studentRepo: Repository<Student>, groupRepo: Repository<Group>, telegramService: TelegramService);
    handleTurnstile(cardId: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    createByTeacher(dto: CreateAttendanceDto, reqUser: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    markGroupAttendance(groupId: number, attendances: {
        studentId: number;
        isPresent: boolean;
    }[], reqUser: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getGroupAttendance(groupId: number, reqUser: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findAll(): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findByStudentUserId(userId: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    findOne(id: number): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    private _notifyParent;
}
