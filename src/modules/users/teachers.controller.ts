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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TeachersService } from './teachers.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly teachersService: TeachersService,
  ) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto, UserRole.TEACHER);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll() {
    return this.usersService.findAllByRole(UserRole.TEACHER);
  }

  @Get('my-groups')
  @AccessRoles(UserRole.TEACHER)
  getMyGroups(@Req() req: any) {
    return this.teachersService.getMyGroups(req.user.id);
  }

  @Get(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneByRole(id, UserRole.TEACHER);
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}
