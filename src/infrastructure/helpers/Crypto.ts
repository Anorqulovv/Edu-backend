import { compare, hash } from "bcrypt";

export class CryptoService {
    async hashPassword(password: string){
        return hash(password, 7);
    }

    async comparePassword(password: string, hashed: string ): Promise<boolean> {
        return compare(password, hashed);
    }
}