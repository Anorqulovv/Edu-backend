import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/databases/entities/user.entity';
import { Group } from 'src/databases/entities/group.entity';
import { CryptoService } from 'src/infrastructure/helpers/Crypto';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group])],
  controllers: [TeacherController],
  providers: [TeacherService, CryptoService],
  exports: [TeacherService],
})
export class TeacherModule {}
