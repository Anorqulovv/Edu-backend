import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/databases/entities/user.entity';
import { Student } from 'src/databases/entities/student.entity';
import { Group } from 'src/databases/entities/group.entity';
import { Test } from 'src/databases/entities/test.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Test) private readonly testRepo: Repository<Test>,
  ) {}

  async getStats(): Promise<ISucces> {
    const [
      totalStudents,
      totalGroups,
      activeGroups,
      totalTeachers,
      totalAdmins,
      totalSupports,
      totalParents,
      totalTests,
    ] = await Promise.all([
      this.studentRepo.count(),
      this.groupRepo.count(),
      this.groupRepo.count({ where: { status: GroupStatus.ACTIVE } }),
      this.userRepo.count({ where: { role: UserRole.TEACHER } }),
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.SUPPORT } }),
      this.userRepo.count({ where: { role: UserRole.PARENT } }),
      this.testRepo.count(),
    ]);

    return succesRes({
      totalStudents,
      totalGroups,
      activeGroups,
      totalTeachers,
      totalAdmins,
      totalSupports,
      totalParents,
      totalTests,
    });
  }
}
