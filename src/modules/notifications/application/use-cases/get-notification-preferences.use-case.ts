import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';
import { NotificationPreferencesResponseDto } from '../dtos/notification-preferences-response.dto';

@Injectable()
export class GetNotificationPreferencesUseCase
  implements UseCase<string, NotificationPreferencesResponseDto>
{
  constructor(
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly repo: INotificationPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<NotificationPreferencesResponseDto> {
    const existing = await this.repo.findByUserId(userId);
    const prefs =
      existing ?? NotificationPreferences.createDefault(randomUUID(), userId);
    return {
      pushEnabled: prefs.pushEnabled,
      debtReminders: prefs.debtReminders,
      priceAlerts: prefs.priceAlerts,
      listReminders: prefs.listReminders,
    };
  }
}
