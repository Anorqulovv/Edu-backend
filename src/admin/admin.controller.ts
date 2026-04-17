import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminsService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN)
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll() {
    return this.adminsService.findAll();
  }

  @Get('stats')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  getStats() {
    return this.adminsService.getDashboardStats();
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN)
  update(@Param('id') id: number, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN)
  remove(@Param('id') id: number) {
    return this.adminsService.remove(id);
  }
}