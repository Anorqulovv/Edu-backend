import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { CryptoService } from 'src/infrastructure/helpers/Crypto';
import { TokenService } from 'src/infrastructure/helpers/Token';
import { User } from 'src/databases/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, TokenService],
  exports: [AuthService],
})
export class AuthModule {}
