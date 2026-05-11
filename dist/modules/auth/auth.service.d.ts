import { Repository } from 'typeorm';
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { TokenService } from "../../infrastructure/helpers/Token";
import { User } from "../../databases/entities/user.entity";
import { LoginDto } from './dto/login';
import { OtpService } from '../otp/otp.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly crypto;
    private readonly token;
    private readonly otpService;
    constructor(userRepo: Repository<User>, crypto: CryptoService, token: TokenService, otpService: OtpService);
    signIn(dto: LoginDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    requestOtpLogin(phone: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    verifyOtpLogin(phone: string, code: string): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
