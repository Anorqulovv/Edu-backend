import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from 'src/databases/entities/parent.entity';
import { User } from 'src/databases/entities/user.entity';
import { Student } from 'src/databases/entities/student.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { BaseService } from 'src/infrastructure/utils/BaseService';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class ParentsService extends BaseService<CreateParentDto, any, Parent> {
  constructor(
    @InjectRepository(Parent) private parentRepo: Repository<Parent>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
  ) {
    super(parentRepo);
  }

  async create(dto: CreateParentDto): Promise<ISucces> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user || user.role !== UserRole.PARENT) {
      throw new NotFoundException('Parent user topilmadi');
    }

    const parent = this.parentRepo.create(dto);
    const saved = await this.parentRepo.save(parent);
    return succesRes(saved, 201);
  }

  async getMyChildren(parentUserId: number) {
    return this.studentRepo.find({
      where: { parent: { userId: parentUserId } },
      relations: ['user', 'group'],
    });
  }
}