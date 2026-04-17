import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/databases/entities/user.entity';
import { Student } from 'src/databases/entities/student.entity';
import { Group } from 'src/databases/entities/group.entity';
import { Test } from 'src/databases/entities/test.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';   
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateAdminDto): Promise<ISucces> {
    return this.usersService.createUser(dto, UserRole.ADMIN);
  }

  async findAll() {
    const admins = await this.userRepo.find({
      where: { role: UserRole.ADMIN },
      select: ['id', 'fullName', 'username', 'phone', 'isActive', 'createdAt'],
    });
    return succesRes(admins);
  }

  async update(id: number, dto: UpdateAdminDto): Promise<ISucces> {
    return this.usersService.update(id, dto);
  }

  async remove(id: number): Promise<ISucces> {
    return this.usersService.delete(id);
  }

  // Dashboard statistikasi
  async getDashboardStats() {
    const totalStudents = await this.studentRepo.count();
    const totalGroups = await this.groupRepo.count();
    const totalTeachers = await this.userRepo.count({ where: { role: UserRole.TEACHER } });
    const totalTests = await this.testRepo.count();

    // To'g'rilangan qator:
    const activeGroups = await this.groupRepo.count({
      where: { status: GroupStatus.ACTIVE }
    });

    return succesRes({
      totalStudents,
      totalGroups,
      activeGroups,
      totalTeachers,
      totalTests,
    });
  }
}