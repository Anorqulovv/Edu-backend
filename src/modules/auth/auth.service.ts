import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CryptoService } from 'src/infrastructure/helpers/Crypto';
import { TokenService } from 'src/infrastructure/helpers/Token';

import { succesRes } from 'src/infrastructure/utils/succes-res';
import { User } from 'src/databases/entities/user.entity';
import { LoginDto } from './dto/login';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
  ) {}

  async signIn(dto: LoginDto) {
    const { username, password } = dto;

    const user = await this.userRepo.findOne({
      where: { username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.crypto.comparePassword(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      role: user.role,
      username: user.username,
      isActive: user.isActive,
    };

    const token = await this.token.generateTokens(payload)

    const { password: _pw, ...safeUser } = user;

    return succesRes({
      token,
      user: safeUser,
    });
  }
}