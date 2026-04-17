import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudentsService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPPORT)
  findAll(@Req() req: any) {
    return this.studentsService.findAll(req.user);
  }

  @Get(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPPORT)
  findOne(@Param('id') id: number) {
    return this.studentsService.findOneById(id);
  }
}