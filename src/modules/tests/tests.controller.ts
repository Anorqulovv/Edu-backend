import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';

import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AddScoreDto } from './dto/add-score.dto';

import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AccessRoles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { SubmitTestDto } from './dto/submit-test.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) { }

  @Post()
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() dto: CreateTestDto, @Req() req: any) {
    return this.testsService.create(dto, req.user);
  }

  @Post('submit')
  @AccessRoles(UserRole.STUDENT)
  async submit(@Req() req: any, @Body() dto: SubmitTestDto) {
    return this.testsService.submitTest(req.user.id, dto.testId, dto.answers);
  }

  @Get()
  @AccessRoles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.SUPPORT,
    UserRole.STUDENT,
  )
  findAll(@Req() req: any) {
    return this.testsService.findAll(req.user);
  }

  @Get(':id')
  @AccessRoles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.SUPPORT,
    UserRole.STUDENT,
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.testsService.findOne(id, req.user);
  }

  @Patch(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTestDto) {
    return this.testsService.update(id, dto);
  }

  @Delete(':id')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testsService.remove(id);
  }

  @Post('score')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  addScore(@Body() dto: AddScoreDto) {
    return this.testsService.addScore(dto);
  }

  // Ustoz o'quvchiga testni qayta ishlashga ruxsat beradi (natija arxivlanadi)
  @Delete(':testId/reset/:studentId')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  resetAttempt(
    @Param('testId', ParseIntPipe) testId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: any,
  ) {
    return this.testsService.resetTestAttempt(req.user.id, studentId, testId);
  }

  // O'quvchining barcha urinishlari tarixi (admin/ustoz uchun)
  @Get('student/:studentId/history')
  @AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  getStudentHistory(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.testsService.getStudentTestHistory(studentId);
  }
}
