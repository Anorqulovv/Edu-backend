import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/databases/entities/student.entity';
import { User } from 'src/databases/entities/user.entity';
import { Group } from 'src/databases/entities/group.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UsersService } from 'src/modules/users/users.service';
import { UserRole } from 'src/common/enums/role.enum';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    private readonly usersService: UsersService,
  ) {}

  // ==================== CREATE ====================
  // Bir vaqtda user va student yaratish (to'liq oqim)
  async createWithUser(
    userDto: CreateUserDto,
    studentExtra: Omit<CreateStudentDto, 'userId'>,
  ): Promise<ISucces> {
    const userResult = await this.usersService.createUser(userDto, UserRole.STUDENT);
    const newUser = userResult.data as any;

    const student = this.studentRepo.create({
      userId: newUser.id,
      ...studentExtra,
    });
    const saved = await this.studentRepo.save(student);
    return succesRes({ user: newUser, student: saved }, 201);
  }

  // Mavjud user uchun student profil yaratish
  async create(dto: CreateStudentDto): Promise<ISucces> {
    const user = await this.usersService.getRepository.findOneBy({ id: dto.userId });
    if (!user || user.role !== UserRole.STUDENT) {
      throw new NotFoundException('STUDENT roli bilan user topilmadi');
    }

    const exists = await this.studentRepo.findOneBy({ userId: dto.userId });
    if (exists) {
      throw new NotFoundException('Bu user uchun student profil allaqachon mavjud');
    }

    if (dto.groupId) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
    }

    const student = this.studentRepo.create(dto);
    const saved = await this.studentRepo.save(student);
    return succesRes(saved, 201);
  }

  // ==================== READ ====================
  async findAll(currentUser: any): Promise<ISucces> {
    let students: Student[];

    if ([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPPORT].includes(currentUser.role)) {
      students = await this.studentRepo.find({
        relations: ['user', 'parent', 'group', 'group.teacher'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // Teacher faqat o'z guruhidagi studentlarni ko'radi
      students = await this.studentRepo.find({
        where: { group: { teacherId: currentUser.id } },
        relations: ['user', 'parent', 'group'],
        order: { createdAt: 'DESC' },
      });
    }

    return succesRes(students);
  }

  async findOne(id: number): Promise<ISucces> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'parent', 'group', 'attendance', 'results'],
    });
    if (!student) throw new NotFoundException(`Student ID ${id} topilmadi`);
    return succesRes(student);
  }

  // ==================== UPDATE ====================
  async update(id: number, dto: UpdateStudentDto): Promise<ISucces> {
    const student = await this.studentRepo.findOneBy({ id });
    if (!student) throw new NotFoundException(`Student ID ${id} topilmadi`);

    if (dto.groupId) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException(`Guruh ID ${dto.groupId} topilmadi`);
    }

    await this.studentRepo.update(id, dto);
    const updated = await this.studentRepo.findOne({
      where: { id },
      relations: ['user', 'parent', 'group'],
    });
    return succesRes(updated);
  }

  // ==================== DELETE ====================
  async remove(id: number): Promise<ISucces> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!student) throw new NotFoundException(`Student ID ${id} topilmadi`);

    // User ham o'chiriladi (CASCADE)
    await this.usersService.removeUser(student.userId);
    return succesRes({ message: 'Student va uning user akkaunt muvaffaqiyatli o\'chirildi' });
  }
}
