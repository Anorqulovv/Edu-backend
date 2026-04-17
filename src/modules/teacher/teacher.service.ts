import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from 'src/databases/entities/group.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class TeachersService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateTeacherDto) {
    return this.usersService.createUser(dto, UserRole.TEACHER);
  }

  async getMyGroups(teacherId: number) {
    return this.groupRepo.find({
      where: { teacherId },
      relations: ['students', 'students.user'],
    });
  }
}