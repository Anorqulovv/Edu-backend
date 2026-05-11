import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { AccessRoles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserRole } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class SendNotifyAllDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(UserRole.SUPERADMIN, UserRole.ADMIN)
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('notify')
  async sendNotify(@Body() dto: SendNotificationDto) {
    await this.telegramService.sendNotification(dto.telegramId, dto.message);
    return { success: true };
  }

  @Post('notify-all')
  async sendNotifyAll(@Body() dto: SendNotifyAllDto) {
    await this.telegramService.broadcastFromAdmin(dto.message);
    return { success: true };
  }
}