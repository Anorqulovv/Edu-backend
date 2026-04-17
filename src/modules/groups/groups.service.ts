import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from 'src/databases/entities/group.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { GroupStatus } from 'src/common/enums/groupStatus.enum';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';
import { BaseService } from 'src/infrastructure/utils/BaseService';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService extends BaseService<CreateGroupDto, UpdateGroupDto, Group> {
  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
  ) {
    super(groupRepo);
  }

  async findAll(currentUser: any): Promise<ISucces> {
    let groups: Group[];

    if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(currentUser.role)) {
      groups = await this.groupRepo.find({
        relations: ['teacher', 'direction', 'students'],
      });
    } else {
      groups = await this.groupRepo.find({
        where: { teacherId: currentUser.id },
        relations: ['teacher', 'direction', 'students'],
      });
    }

    return succesRes(groups);
  }

  async findOneWithStudents(id: number): Promise<ISucces> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['teacher', 'direction', 'students', 'students.user'],
    });

    if (!group) throw new NotFoundException('Group topilmadi');

    return succesRes(group);
  }

  async updateStatus(id: number, status: GroupStatus): Promise<ISucces> {
    await this.groupRepo.update(id, { status });
    return succesRes({ message: 'Guruh holati yangilandi' });
  }
}