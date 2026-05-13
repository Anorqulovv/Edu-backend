import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from 'src/databases/entities/test.entity';
import { TestResult } from 'src/databases/entities/test-result.entity';
import { Student } from 'src/databases/entities/student.entity';
import { Parent } from 'src/databases/entities/parent.entity';
import { Question } from 'src/databases/entities/question.entity';

import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { TelegramModule } from 'src/modules/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, TestResult, Student, Parent, Question]),
    TelegramModule,
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule {}
