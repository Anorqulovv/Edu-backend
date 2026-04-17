import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/databases/entities/user.entity';
import { Student } from 'src/databases/entities/student.entity';
import { Group } from 'src/databases/entities/group.entity';
import { Test } from 'src/databases/entities/test.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { AdminsController } from './admin.controller';
import { AdminsService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Group, Test]),
    UsersModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}