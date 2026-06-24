import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from 'src/databases/entities/group.entity';
import { Direction } from 'src/databases/entities/direction.entity';
import { User } from 'src/databases/entities/user.entity';

@Module({
  imports: [
    JwtModule.register({}),TypeOrmModule.forFeature([Group, Direction, User])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}