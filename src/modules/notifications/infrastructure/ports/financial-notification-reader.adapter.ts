import { Inject, Injectable } from '@nestjs/common';
import type {
  FinancialNotificationView,
  IFinancialNotificationReader,
} from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { NotificationStatus } from '../../../../shared-kernel/domain/enums/notification-status.enum';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class FinancialNotificationReaderAdapter
  implements IFinancialNotificationReader
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async findActiveByFinancialId(
    financialId: string,
  ): Promise<FinancialNotificationView | null> {
    const notifications =
      await this.notificationRepository.findByFinancialId(financialId);
    const chosen = this.pickActive(notifications);
    return chosen ? this.toView(chosen) : null;
  }

  async findActiveByFinancialIds(
    financialIds: string[],
  ): Promise<Map<string, FinancialNotificationView>> {
    const result = new Map<string, FinancialNotificationView>();
    if (financialIds.length === 0) return result;

    const unique = Array.from(new Set(financialIds));
    const notifications =
      await this.notificationRepository.findByFinancialIds(unique);

    const grouped = new Map<string, Notification[]>();
    for (const n of notifications) {
      const bucket = grouped.get(n.financialId) ?? [];
      bucket.push(n);
      grouped.set(n.financialId, bucket);
    }

    for (const [financialId, bucket] of grouped) {
      const chosen = this.pickActive(bucket);
      if (chosen) {
        result.set(financialId, this.toView(chosen));
      }
    }

    return result;
  }

  private pickActive(notifications: Notification[]): Notification | null {
    return (
      notifications.find((n) => n.status === NotificationStatus.PENDING) ??
      notifications[0] ??
      null
    );
  }

  private toView(notification: Notification): FinancialNotificationView {
    return {
      id: notification.id,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      status: notification.status,
    };
  }
}
