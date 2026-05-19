import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type { INotificationPreferencesRepository } from '../../../auth/domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../../auth/domain/interfaces/repositories/notification-preferences.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { NotificationMapper } from '../mappers/notification.mapper';

interface ScheduleFinancialNotificationInput {
  userId: string;
  financialId: string;
  date: Date;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ScheduleFinancialNotificationUseCase implements UseCase<
  ScheduleFinancialNotificationInput,
  NotificationResponseDto | null
> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
  ) {}

  async execute(
    input: ScheduleFinancialNotificationInput,
  ): Promise<NotificationResponseDto | null> {
    const prefs = await this.prefsRepository.findByUserId(input.userId);
    if (!prefs || !prefs.pushEnabled || !prefs.debtReminders) {
      return null;
    }

    await this.notificationRepository.deleteByFinancialId(input.financialId);

    const scheduledAt = new Date(input.date.getTime() - ONE_DAY_MS);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    if (scheduledAt.getTime() < todayStart.getTime()) {
      return null;
    }

    const notification = Notification.create(
      randomUUID(),
      input.userId,
      input.financialId,
      scheduledAt,
    );

    const saved = await this.notificationRepository.save(notification);
    return NotificationMapper.toResponse(saved);
  }
}
