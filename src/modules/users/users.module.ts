import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/databases/entities/user.entity';
import { CryptoService } from 'src/infrastructure/helpers/Crypto';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, CryptoService],
  exports: [UsersService],
})
export class UsersModule {}