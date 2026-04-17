import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "src/databases/entities/user.entity";
import { Student } from "src/databases/entities/student.entity";
import { Parent } from "src/databases/entities/parent.entity";
import { Group } from "src/databases/entities/group.entity";
import { Attendance } from "src/databases/entities/attendance.entity";
import { TestResult } from "src/databases/entities/test-result.entity";
import { Test } from "src/databases/entities/test.entity"; 

import { TelegramController } from "./telegram.controller";
import { TelegramService } from "./telegram.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Parent, Group, Attendance, TestResult, Test]),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}