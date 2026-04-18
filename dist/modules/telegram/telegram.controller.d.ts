import { TelegramService } from './telegram.service';
import { SendNotificationDto } from './dto/send-notification.dto';
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    sendNotify(dto: SendNotificationDto): Promise<{
        success: boolean;
    }>;
}
