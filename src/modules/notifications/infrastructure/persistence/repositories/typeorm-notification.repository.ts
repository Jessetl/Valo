import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import type { INotificationRepository } from '../../../domain/interfaces/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationStatus } from '../../../domain/enums/notification-status.enum';
import { NotificationOrmEntity } from '../orm-entities/notification.orm-entity';
import { NotificationPersistenceMapper } from '../mappers/notification-persistence.mapper';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly ormRepository: Repository<NotificationOrmEntity>,
  ) {}

  async findById(id: string): Promise<Notification | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? NotificationPersistenceMapper.toDomain(orm) : null;
  }

  async findPendingBefore(date: Date): Promise<Notification[]> {
    const dateOnly = date.toISOString().split('T')[0];
    const orms = await this.ormRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: LessThanOrEqual(dateOnly as unknown as Date),
      },
      order: { scheduledAt: 'ASC' },
    });
    return orms.map((orm) => NotificationPersistenceMapper.toDomain(orm));
  }

  async findByFinancialId(financialId: string): Promise<Notification[]> {
    const orms = await this.ormRepository.find({
      where: { financialId },
      order: { scheduledAt: 'DESC' },
    });
    return orms.map((orm) => NotificationPersistenceMapper.toDomain(orm));
  }

  async save(notification: Notification): Promise<Notification> {
    const orm = NotificationPersistenceMapper.toOrm(notification);
    const saved = await this.ormRepository.save(orm);
    return NotificationPersistenceMapper.toDomain(saved);
  }

  async deleteByFinancialId(financialId: string): Promise<void> {
    await this.ormRepository.delete({ financialId });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.ormRepository.delete({
      userId,
      status: NotificationStatus.PENDING,
    });
  }
}
