import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { DashboardService } from './dashboard.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('admins')
export class AdminsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto, UserRole.ADMIN);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll() {
    return this.usersService.findAllByRole(UserRole.ADMIN);
  }

  @Get('stats')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneByRole(id, UserRole.ADMIN);
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeUser(id);
  }
}
