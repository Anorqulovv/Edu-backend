import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './student.service';
import { StudentsController } from './student.controller';
import { Student } from 'src/databases/entities/student.entity';
import { Group } from 'src/databases/entities/group.entity';
import { Parent } from 'src/databases/entities/parent.entity';
import { User } from 'src/databases/entities/user.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { TelegramModule } from 'src/modules/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Group, Parent, User]),
    UsersModule,
    TelegramModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
