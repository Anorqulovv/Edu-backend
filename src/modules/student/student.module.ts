import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './student.service';
import { StudentsController } from './student.controller';
import { Student } from 'src/databases/entities/student.entity';
import { User } from 'src/databases/entities/user.entity';
import { Parent } from 'src/databases/entities/parent.entity';
import { Group } from 'src/databases/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, Parent, Group])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}