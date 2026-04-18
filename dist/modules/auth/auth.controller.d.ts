import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signIn(dto: LoginDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
    getMe(req: any): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
