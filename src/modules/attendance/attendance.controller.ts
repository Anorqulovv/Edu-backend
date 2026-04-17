import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}
  
  @Post('turnstile')
  handleTurnstile(@Body('cardId') cardId: string) {
    return this.attendanceService.handleTurnstile(cardId);
  }

  @Post()
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }
}