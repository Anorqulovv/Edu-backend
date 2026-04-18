import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminsController } from './admins.controller';
import { TeachersController } from './teachers.controller';
import { SupportsController } from './supports.controller';
import { TeachersService } from './teachers.service';
import { DashboardService } from './dashboard.service';
import { User } from 'src/databases/entities/user.entity';
import { Student } from 'src/databases/entities/student.entity';
import { Group } from 'src/databases/entities/group.entity';
import { Test } from 'src/databases/entities/test.entity';
import { CryptoService } from 'src/infrastructure/helpers/Crypto';

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Group, Test])],
  providers: [UsersService, TeachersService, DashboardService, CryptoService],
  controllers: [
    UsersController,
    AdminsController,
    TeachersController,
    SupportsController,
  ],
  exports: [UsersService, TeachersService, DashboardService],
})
export class UsersModule {}
