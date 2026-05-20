import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import type {
  INotificationRepository,
  PaginatedNotifications,
  SearchNotificationsParams,
} from '../../../domain/interfaces/repositories/notification.repository.interface';
import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationStatus } from '../../../domain/enums/notification-status.enum';
import { NotificationOrmEntity } from '../orm-entities/notification.orm-entity';
import { NotificationPersistenceMapper } from '../mappers/notification-persistence.mapper';

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

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

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Notification | null> {
    const orm = await this.ormRepository.findOne({ where: { id, userId } });
    return orm ? NotificationPersistenceMapper.toDomain(orm) : null;
  }

  async findPendingBefore(date: Date): Promise<Notification[]> {
    const dateOnly = toDateOnly(date);
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

  async findByFinancialIds(financialIds: string[]): Promise<Notification[]> {
    if (financialIds.length === 0) return [];
    const orms = await this.ormRepository.find({
      where: { financialId: In(financialIds) },
      order: { scheduledAt: 'DESC' },
    });
    return orms.map((orm) => NotificationPersistenceMapper.toDomain(orm));
  }

  async search(
    params: SearchNotificationsParams,
  ): Promise<PaginatedNotifications> {
    const { userId, page, limit, filters } = params;
    const qb = this.ormRepository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId });

    if (filters?.isRead !== undefined && filters?.isRead !== null) {
      qb.andWhere('n.is_read = :isRead', { isRead: filters.isRead });
    }
    if (filters?.status) {
      qb.andWhere('n.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      qb.andWhere('n.type = :type', { type: filters.type });
    }
    if (filters?.scheduledDateFrom) {
      qb.andWhere('n.scheduled_at >= :from', {
        from: toDateOnly(filters.scheduledDateFrom),
      });
    }
    if (filters?.scheduledDateTo) {
      qb.andWhere('n.scheduled_at <= :to', {
        to: toDateOnly(filters.scheduledDateTo),
      });
    }

    const [orms, total] = await qb
      .orderBy('n.scheduled_at', 'DESC')
      .addOrderBy('n.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: orms.map((orm) => NotificationPersistenceMapper.toDomain(orm)),
      total,
    };
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.ormRepository.count({ where: { userId, isRead: false } });
  }

  async markAllAsReadByUserId(userId: string): Promise<number> {
    const result = await this.ormRepository
      .createQueryBuilder()
      .update(NotificationOrmEntity)
      .set({ isRead: true })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();
    return result.affected ?? 0;
  }

  async save(notification: Notification): Promise<Notification> {
    const orm = NotificationPersistenceMapper.toOrm(notification);
    const saved = await this.ormRepository.save(orm);
    return NotificationPersistenceMapper.toDomain(saved);
  }

  async deleteById(id: string): Promise<void> {
    await this.ormRepository.delete({ id });
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
