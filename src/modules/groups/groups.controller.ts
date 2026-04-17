import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPPORT)
  findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.groupsService.findOneById(id);
  }

  @Get(':id/details')
  getDetails(@Param('id') id: number) {
    return this.groupsService.findOneWithStudents(id);
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id') id: number, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Patch(':id/status')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.groupsService.updateStatus(id, status as any);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  remove(@Param('id') id: number) {
    return this.groupsService.delete(id);
  }
}