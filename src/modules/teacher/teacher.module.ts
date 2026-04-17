import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teacher.service';
import { TeachersController } from './teacher.controller';
import { User } from 'src/databases/entities/user.entity';
import { Group } from 'src/databases/entities/group.entity';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group]), UsersModule],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}