import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  @Get('me')
@UseGuards(AuthGuard)
async getMe(@Req() req: any) {
  const { password: _, ...user } = req.user;
  return succesRes(user);
}
}
