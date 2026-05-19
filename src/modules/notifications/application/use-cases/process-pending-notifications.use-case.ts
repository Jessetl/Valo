import { Inject, Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type { INotificationQueueService } from '../../domain/interfaces/notification-queue.service.interface';
import { NOTIFICATION_QUEUE_SERVICE } from '../../domain/interfaces/notification-queue.service.interface';
import type { IUserRepository } from '../../../auth/domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../auth/domain/interfaces/repositories/user.repository.interface';
import type { INotificationPreferencesRepository } from '../../../auth/domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../../auth/domain/interfaces/repositories/notification-preferences.repository.interface';
import type { IFinancialRecordRepository } from '../../../finances/domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../../finances/domain/interfaces/repositories/financial-record.repository.interface';
import type { IUserDeviceRepository } from '../../../auth/domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../../auth/domain/interfaces/repositories/user-device.repository.interface';

@Injectable()
export class ProcessPendingNotificationsUseCase implements UseCase<
  void,
  number
> {
  private readonly logger = new Logger(ProcessPendingNotificationsUseCase.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(NOTIFICATION_QUEUE_SERVICE)
    private readonly queueService: INotificationQueueService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
  ) {}

  async execute(): Promise<number> {
    const now = new Date();
    const pending = await this.notificationRepository.findPendingBefore(now);

    if (pending.length === 0) return 0;

    let published = 0;

    for (const notification of pending) {
      try {
        const user = await this.userRepository.findById(notification.userId);
        if (!user) continue;

        const prefs = await this.prefsRepository.findByUserId(
          notification.userId,
        );
        if (!prefs || !prefs.pushEnabled || !prefs.debtReminders) continue;

        const record = await this.recordRepository.findById(
          notification.financialId,
        );
        if (!record) continue;

        const devices = await this.deviceRepository.findByUserId(
          notification.userId,
        );
        const fcmTokens = devices
          .map((d) => d.fcmToken)
          .filter((t): t is string => typeof t === 'string' && t.length > 0);

        if (fcmTokens.length === 0) continue;

        for (const fcmToken of fcmTokens) {
          await this.queueService.publish({
            notificationId: notification.id,
            userId: notification.userId,
            financialId: notification.financialId,
            financialTitle: record.title,
            notificationType: notification.type,
            fcmToken,
          });
        }

        published++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to publish notification ${notification.id}: ${message}`,
        );
      }
    }

    this.logger.log(`Published ${published}/${pending.length} notifications`);
    return published;
  }
}
