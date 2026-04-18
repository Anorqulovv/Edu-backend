import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from "../../databases/entities/user.entity";
export declare class TelegramService implements OnModuleInit {
    private userRepo;
    private bot;
    private broadcastUsers;
    constructor(userRepo: Repository<User>);
    onModuleInit(): void;
    private normalizePhone;
    private getCurrentUser;
    private showWelcome;
    private linkPhoneToUser;
    private showMainMenu;
    private setupCommands;
    private startBroadcast;
    private broadcastMessage;
    sendNotification(telegramId: string, message: string): Promise<void>;
}
