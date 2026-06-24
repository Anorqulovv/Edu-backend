import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/databases/entities/notification.entity';
import { Repository } from 'typeorm';
import { succesRes } from 'src/infrastructure/utils/succes-res';
import { ISucces } from 'src/infrastructure/utils/succes-interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createForUser(payload: {
    recipientId: number;
    senderId?: number;
    title?: string;
    message: string;
    type?: string;
  }) {
    const notification = this.notificationRepo.create({
      recipientId: payload.recipientId,
      senderId: payload.senderId,
      title: payload.title ?? 'Xabar',
      message: payload.message,
      type: payload.type ?? 'MESSAGE',
    });

    return this.notificationRepo.save(notification);
  }

  async createForUsers(payload: {
    recipientIds: number[];
    senderId?: number;
    title?: string;
    message: string;
    type?: string;
  }) {
    if (!payload.recipientIds.length) return [];

    const notifications = payload.recipientIds.map((recipientId) =>
      this.notificationRepo.create({
        recipientId,
        senderId: payload.senderId,
        title: payload.title ?? 'Xabar',
        message: payload.message,
        type: payload.type ?? 'MESSAGE',
      }),
    );

    return this.notificationRepo.save(notifications);
  }

  async findMy(userId: number): Promise<ISucces> {
    const data = await this.notificationRepo.find({
      where: { recipientId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return succesRes(data);
  }

  async unreadCount(userId: number): Promise<ISucces> {
    const count = await this.notificationRepo.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return succesRes({ count });
  }

  async markAsRead(id: number, userId: number): Promise<ISucces> {
    const notification = await this.notificationRepo.findOne({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification topilmadi');
    }

    await this.notificationRepo.update(id, {
      isRead: true,
      readAt: new Date(),
    });

    return succesRes({ message: "O'qildi" });
  }

  async markAllAsRead(userId: number): Promise<ISucces> {
    await this.notificationRepo.update(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return succesRes({ message: "Barchasi o'qildi" });
  }
}
