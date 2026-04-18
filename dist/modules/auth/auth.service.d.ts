import { Repository } from 'typeorm';
import { CryptoService } from "../../infrastructure/helpers/Crypto";
import { TokenService } from "../../infrastructure/helpers/Token";
import { User } from "../../databases/entities/user.entity";
import { LoginDto } from './dto/login';
export declare class AuthService {
    private readonly userRepo;
    private readonly crypto;
    private readonly token;
    constructor(userRepo: Repository<User>, crypto: CryptoService, token: TokenService);
    signIn(dto: LoginDto): Promise<import("../../infrastructure/utils/succes-interface").ISucces>;
}
