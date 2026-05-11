import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';
import { Branch } from 'src/databases/entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto): Promise<ISucces> {
    const exists = await this.branchRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Bu nomdagi filial allaqachon mavjud');
    const branch = this.branchRepo.create(dto);
    const saved = await this.branchRepo.save(branch);
    return succesRes(saved, 201);
  }

  async findAll(name?: string): Promise<ISucces> {
    const where = name ? { name: ILike(`%${name}%`) } : {};
    const data = await this.branchRepo.find({ where, order: { name: 'ASC' } });
    return succesRes(data);
  }

  async findOne(id: number): Promise<ISucces> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Filial ID ${id} topilmadi`);
    return succesRes(branch);
  }

  async update(id: number, dto: UpdateBranchDto): Promise<ISucces> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Filial ID ${id} topilmadi`);
    if (dto.name) {
      const exists = await this.branchRepo.findOne({ where: { name: dto.name, id: Not(id) } });
      if (exists) throw new ConflictException('Bu nomdagi filial allaqachon mavjud');
    }
    await this.branchRepo.update(id, dto);
    const updated = await this.branchRepo.findOne({ where: { id } });
    return succesRes(updated!);
  }

  async remove(id: number): Promise<ISucces> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Filial ID ${id} topilmadi`);
    await this.branchRepo.delete(id);
    return succesRes({ message: 'Filial o\'chirildi' });
  }
}
