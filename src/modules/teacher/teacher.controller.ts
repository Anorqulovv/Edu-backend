import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { TeachersService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get('my-groups')
  @AccessRoles(UserRole.TEACHER)
  getMyGroups(@Req() req: any) {
    return this.teachersService.getMyGroups(req.user.id);
  }
}