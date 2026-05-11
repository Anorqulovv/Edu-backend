import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsService } from './parent.service';
import { ParentsController } from './parent.controller';
import { Parent } from 'src/databases/entities/parent.entity';
import { Student } from 'src/databases/entities/student.entity';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Student]),
    UsersModule,
  ],
  providers: [ParentsService],
  controllers: [ParentsController],
  exports: [ParentsService],
})
export class ParentsModule {}
