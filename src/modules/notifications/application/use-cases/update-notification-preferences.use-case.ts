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
      pushEnabled: input.dto.pushEnabled,
      debtReminders: input.dto.debtReminders,
      priceAlerts: input.dto.priceAlerts,
      listReminders: input.dto.listReminders,
    });

    const saved = await this.repo.save(updated);
    return {
      pushEnabled: saved.pushEnabled,
      debtReminders: saved.debtReminders,
      priceAlerts: saved.priceAlerts,
      listReminders: saved.listReminders,
    };
  }
}
