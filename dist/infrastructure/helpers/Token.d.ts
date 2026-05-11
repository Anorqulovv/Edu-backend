import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/enums/role.enum';
export type TokenPayload = {
    id: number;
    role: UserRole;
    isActive: boolean;
};
export declare class TokenService {
    private readonly jwt;
    constructor(jwt: JwtService);
    generateAccessToken(payload: TokenPayload): Promise<string>;
    generateRefreshToken(payload: TokenPayload): Promise<string>;
    generateTokens(payload: TokenPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    checkAccessToken(token: string): Promise<any>;
    checkRefreshToken(token: string): Promise<any>;
}
