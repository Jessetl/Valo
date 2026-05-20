import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';
import { UpdateNotificationPreferencesDto } from '../dtos/update-notification-preferences.dto';
import { NotificationPreferencesResponseDto } from '../dtos/notification-preferences-response.dto';

interface UpdateNotificationPreferencesInput {
  userId: string;
  dto: UpdateNotificationPreferencesDto;
}

@Injectable()
export class UpdateNotificationPreferencesUseCase
  implements
    UseCase<
      UpdateNotificationPreferencesInput,
      NotificationPreferencesResponseDto
    >
{
  constructor(
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly repo: INotificationPreferencesRepository,
  ) {}

  async execute(
    input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferencesResponseDto> {
    const existing = await this.repo.findByUserId(input.userId);
    const base =
      existing ??
      NotificationPreferences.createDefault(randomUUID(), input.userId);

    const updated = base.updateFields({
      pushEnabled: input.dto.push_enabled,
      debtReminders: input.dto.debt_reminders,
      priceAlerts: input.dto.price_alerts,
      listReminders: input.dto.list_reminders,
    });

    const saved = await this.repo.save(updated);
    return {
      push_enabled: saved.pushEnabled,
      debt_reminders: saved.debtReminders,
      price_alerts: saved.priceAlerts,
      list_reminders: saved.listReminders,
    };
  }
}
