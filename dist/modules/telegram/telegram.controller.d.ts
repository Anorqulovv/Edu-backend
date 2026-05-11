import { TelegramService } from './telegram.service';
import { SendNotificationDto } from './dto/send-notification.dto';
declare class SendNotifyAllDto {
    message: string;
}
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    sendNotify(dto: SendNotificationDto): Promise<{
        success: boolean;
    }>;
    sendNotifyAll(dto: SendNotifyAllDto): Promise<{
        success: boolean;
    }>;
}
export {};
