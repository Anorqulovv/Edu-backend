import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
declare class OtpRequestDto {
    phone: string;
}
declare class OtpVerifyDto {
    phone: string;
    code: string;
}
declare class UpdateProfileDto {
    fullName?: string;
    username?: string;
    phone?: string;
    avatar?: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly userRepo;
    constructor(authService: AuthService, userRepo: Repository<User>);
    signIn(dto: LoginDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    sendOtp(dto: OtpRequestDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    verifyOtp(dto: OtpVerifyDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getMe(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
export {};
