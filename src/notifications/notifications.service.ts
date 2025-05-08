import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(userId: string) {
    const notifications = await this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });

    return notifications.map(notification => ({
      ...notification,
      created_at: new Date(notification.created_at.getTime() + (9 * 60 * 60 * 1000)).toISOString(), // UTC+9 (KST)
    }));
  }

  async create(user: User, type: string, message: string, relatedId?: string) {
    const notification = this.notificationsRepository.create({
      user,
      type,
      message,
      related_id: relatedId,
    });
    return await this.notificationsRepository.save(notification);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      return null;
    }

    notification.is_read = true;
    return await this.notificationsRepository.save(notification);
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    if (notification.user.id !== userId) {
      throw new UnauthorizedException('알림을 삭제할 권한이 없습니다.');
    }

    await this.notificationsRepository.remove(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: {
        user: { id: userId },
        is_read: false,
      },
    });
  }
} 