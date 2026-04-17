import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from 'src/databases/entities/attendance.entity';
import { Student } from 'src/databases/entities/student.entity';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Student]),
    TelegramModule 
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}