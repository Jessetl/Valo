import { Inject, Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type { INotificationQueueService } from '../../domain/interfaces/notification-queue.service.interface';
import { NOTIFICATION_QUEUE_SERVICE } from '../../domain/interfaces/notification-queue.service.interface';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import type { IFinancialRecordReader } from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import { FINANCIAL_RECORD_READER } from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import type { IUserReader } from '../../../../shared-kernel/application/ports/user-reader.port';
import { USER_READER } from '../../../../shared-kernel/application/ports/user-reader.port';
import type { IUserDeviceReader } from '../../../../shared-kernel/application/ports/user-device-reader.port';
import { USER_DEVICE_READER } from '../../../../shared-kernel/application/ports/user-device-reader.port';

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
    @Inject(USER_READER)
    private readonly userReader: IUserReader,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
    @Inject(FINANCIAL_RECORD_READER)
    private readonly recordReader: IFinancialRecordReader,
    @Inject(USER_DEVICE_READER)
    private readonly deviceReader: IUserDeviceReader,
  ) {}

  async execute(): Promise<number> {
    const now = new Date();
    const pending = await this.notificationRepository.findPendingBefore(now);

    if (pending.length === 0) return 0;

    const financialIds = pending.map((n) => n.financialId);
    const records = await this.recordReader.findByIds(financialIds);
    const recordsMap = new Map(records.map((r) => [r.id, r]));

    let published = 0;

    for (const notification of pending) {
      try {
        const userExists = await this.userReader.existsById(notification.userId);
        if (!userExists) continue;

        const prefs = await this.prefsRepository.findByUserId(
          notification.userId,
        );
        if (!prefs || !prefs.pushEnabled || !prefs.debtReminders) continue;

        const record = recordsMap.get(notification.financialId);
        if (!record) continue;

        const fcmTokens = await this.deviceReader.findFcmTokensByUserId(
          notification.userId,
        );

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
