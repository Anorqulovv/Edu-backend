import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/databases/entities/student.entity';
import { User } from 'src/databases/entities/user.entity';
import { Parent } from 'src/databases/entities/parent.entity';
import { Group } from 'src/databases/entities/group.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { BaseService } from 'src/infrastructure/utils/BaseService';
import { UserRole } from 'src/common/enums/role.enum';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class StudentsService extends BaseService<CreateStudentDto, any, Student> {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
  ) {
    super(studentRepo);
  }

  async create(dto: CreateStudentDto): Promise<ISucces> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user || user.role !== UserRole.STUDENT) {
      throw new NotFoundException('Student user topilmadi');
    }

    const student = this.studentRepo.create(dto);
    const saved = await this.studentRepo.save(student);

    return succesRes(saved, 201);
  }

  async findAll(currentUser: any): Promise<ISucces> {
    let students: Student[];

    if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(currentUser.role)) {
      students = await this.studentRepo.find({
        relations: ['user', 'parent', 'group', 'group.teacher'],
      });
    } else {
      students = await this.studentRepo.find({
        where: { group: { teacherId: currentUser.id } },
        relations: ['user', 'parent', 'group', 'group.teacher'],
      });
    }

    return succesRes(students);
  }

}