import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import {
  USER_REGISTERED,
  UserRegisteredEvent,
} from '../../../../shared-kernel/domain/events/user.events';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';

@Injectable()
export class UserEventsHandler {
  private readonly logger = new Logger(UserEventsHandler.name);

  constructor(
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
  ) {}

  @OnEvent(USER_REGISTERED, { promisify: true })
  async onRegistered(event: UserRegisteredEvent): Promise<void> {
    try {
      const existing = await this.prefsRepository.findByUserId(event.userId);
      if (existing) return;
      const prefs = NotificationPreferences.createDefault(
        randomUUID(),
        event.userId,
      );
      await this.prefsRepository.save(prefs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create default notification preferences for ${event.userId}: ${message}`,
      );
    }
  }
}
