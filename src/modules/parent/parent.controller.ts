import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ParentsService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateParentDto) {
    return this.parentsService.create(dto);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPPORT)
  findAll() {
    return this.parentsService.findAll();
  }

  @Get('my-children')
  @AccessRoles(UserRole.PARENT)
  getMyChildren(@Req() req: any) {
    return this.parentsService.getMyChildren(req.user.id);
  }
}