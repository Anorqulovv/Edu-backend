import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from 'src/databases/entities/test.entity';
import { TestResult } from 'src/databases/entities/test-result.entity';
import { Student } from 'src/databases/entities/student.entity';

import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, TestResult, Student]),
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule {}