import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Group } from 'src/databases/entities/group.entity';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class TeachersService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async getMyGroups(teacherId: number): Promise<ISucces> {
    const groups = await this.groupRepo.find({
      where: { teacherId },
      relations: ['students', 'students.user'],
      order: { createdAt: 'DESC' },
    });
    return succesRes(groups);
  }

  async update(id: number, dto: UpdateUserDto): Promise<ISucces> {
    const existing = await this.usersService.getRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });
    if (!existing) throw new NotFoundException(`Teacher ID ${id} topilmadi`);
    return this.usersService.updateUser(id, dto);
  }

  async remove(id: number): Promise<ISucces> {
    const existing = await this.usersService.getRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });
    if (!existing) throw new NotFoundException(`Teacher ID ${id} topilmadi`);

    const groupsCount = await this.groupRepo.count({ where: { teacherId: id } });
    if (groupsCount > 0) {
      throw new ConflictException(
        `Bu o'qituvchi ${groupsCount} ta guruhga biriktirilgan. Avval guruhlarni o'zgartiring.`,
      );
    }
    return this.usersService.removeUser(id);
  }
}
