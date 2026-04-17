import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from './parent.service';
import { ParentsController } from './parent.controller';
import { Parent } from 'src/databases/entities/parent.entity';
import { Student } from 'src/databases/entities/student.entity';
import { User } from 'src/databases/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Student, User])],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}