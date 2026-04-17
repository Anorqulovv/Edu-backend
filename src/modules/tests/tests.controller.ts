import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateTestDto) {
    return this.testsService.create(dto);
  }

  @Get()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPPORT)
  findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.SUPPORT)
  findOne(@Param('id') id: number) {
    return this.testsService.findOne(id);
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id') id: number, @Body() dto: UpdateTestDto) {
    return this.testsService.update(id, dto);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  remove(@Param('id') id: number) {
    return this.testsService.remove(id);
  }

  @Post('score')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  addScore(@Body() dto: AddScoreDto) {
    return this.testsService.addScore(dto);
  }
}