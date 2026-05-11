import { OtpService } from './otp.service';
declare class SendOtpDto {
    phone: string;
}
declare class VerifyOtpDto {
    phone: string;
    code: string;
}
export declare class OtpController {
    private readonly otpService;
    constructor(otpService: OtpService);
    send(dto: SendOtpDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    verify(dto: VerifyOtpDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
export {};
