import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
import { TelegramService } from '../telegram/telegram.service';
export declare class OtpService {
    private readonly userRepo;
    private readonly telegramService;
    private otpStore;
    constructor(userRepo: Repository<User>, telegramService: TelegramService);
    sendOtp(phone: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    verifyOtp(phone: string, code: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    private _generateCode;
    private _normalizePhone;
}
