import { Notification } from '../../../domain/entities/notification.entity';
import { NotificationOrmEntity } from '../orm-entities/notification.orm-entity';

function toUtcDate(value: string | Date | null): Date | null {
  if (value === null) return null;
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class NotificationPersistenceMapper {
  static toDomain(orm: NotificationOrmEntity): Notification {
    return Notification.reconstitute(orm.id, {
      userId: orm.userId,
      financialId: orm.financialId,
      type: orm.type,
      scheduledAt: toUtcDate(orm.scheduledAt as unknown as string | Date)!,
      sentAt: toUtcDate(orm.sentAt as unknown as string | Date | null),
      status: orm.status,
      isRead: orm.isRead,
    });
  }

  static toOrm(notification: Notification): NotificationOrmEntity {
    const orm = new NotificationOrmEntity();
    orm.id = notification.id;
    orm.userId = notification.userId;
    orm.financialId = notification.financialId;
    orm.type = notification.type;
    orm.scheduledAt = toDateOnly(notification.scheduledAt) as unknown as Date;
    orm.sentAt = notification.sentAt
      ? (toDateOnly(notification.sentAt) as unknown as Date)
      : null;
    orm.status = notification.status;
    orm.isRead = notification.isRead;
    return orm;
  }
}
