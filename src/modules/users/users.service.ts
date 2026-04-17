import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { BaseService } from 'src/infrastructure/utils/BaseService';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CryptoService } from 'src/infrastructure/helpers/Crypto';

import { succesRes } from 'src/infrastructure/utils/succes-res';
import { User } from 'src/databases/entities/user.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { envConfig } from 'src/common/config';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class UsersService
  extends BaseService<CreateUserDto, UpdateUserDto, User>
  implements OnModuleInit
{
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly crypto: CryptoService,
  ) {
    super(userRepo);
  }

 async onModuleInit() {
  const existsSuperAdmin = await this.userRepo.findOne({
    where: { role: UserRole.SUPERADMIN },
  });

  if (!existsSuperAdmin) {
    let phone = envConfig.SUPERADMIN.PHONE;
    phone = phone.replace(/[^+\d]/g, ''); 

    if (!phone.startsWith('+998')) {
      phone = '+998' + phone.replace(/^\+?998?/, '');
    }

    const superAdmin = this.userRepo.create({
      username: envConfig.SUPERADMIN.USERNAME,
      phone: phone,
      password: await this.crypto.hashPassword(envConfig.SUPERADMIN.PASSWORD),
      role: UserRole.SUPERADMIN,
      fullName: 'Super Admin'
    });

    await this.userRepo.save(superAdmin);
    console.log(`✅ Superadmin yaratildi: ${phone}`);
  }
}

  async createUser(dto: CreateUserDto, role: UserRole): Promise<ISucces> {
    const { username, phone, password } = dto;

    const exists = await this.userRepo.findOne({
      where: [{ username }, { phone }],
    });

    if (exists) {
      if (exists.username === username) {
        throw new ConflictException('username already exists');
      }

      if (exists.phone === phone) {
        throw new ConflictException('phone already exists');
      }
    }

    const hashPass = await this.crypto.hashPassword(password);

    const user = this.userRepo.create({
      ...dto,
      password: hashPass,
      role,
    });

    const saved = await this.userRepo.save(user);

    const { password: _, ...result } = saved;

    return succesRes(result, 201);
  }

  async update(id: number, dto: UpdateUserDto): Promise<ISucces> {
    const current = await this.userRepo.findOneBy({ id });

    if (!current) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.username && dto.username !== current.username) {
      const existsUsername = await this.userRepo.findOne({
        where: { username: dto.username, id: Not(id) },
      });

      if (existsUsername) {
        throw new ConflictException('username already exists');
      }
    }

    if (dto.phone && dto.phone !== current.phone) {
      const existsPhone = await this.userRepo.findOne({
        where: { phone: dto.phone, id: Not(id) },
      });

      if (existsPhone) {
        throw new ConflictException('phone already exists');
      }
    }

    if (dto.password) {
      dto.password = await this.crypto.hashPassword(dto.password);
    }

    await this.userRepo.update(id, dto);

    const updated = await this.userRepo.findOneBy({ id });

    if (!updated) {
      throw new NotFoundException('Updated user not found');
    }

    const { password: _, ...result } = updated;

    return succesRes(result);
  }
}