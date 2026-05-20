import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FINANCIAL_RECORD_CREATED,
  FINANCIAL_RECORD_DELETED,
  FINANCIAL_RECORD_UPDATED,
  FinancialRecordCreatedEvent,
  FinancialRecordDeletedEvent,
  FinancialRecordUpdatedEvent,
} from '../../../../shared-kernel/domain/events/financial-record.events';
import { ScheduleFinancialNotificationUseCase } from '../use-cases/schedule-financial-notification.use-case';
import { CancelFinancialNotificationsUseCase } from '../use-cases/cancel-financial-notifications.use-case';

@Injectable()
export class FinancialRecordEventsHandler {
  private readonly logger = new Logger(FinancialRecordEventsHandler.name);

  constructor(
    private readonly scheduleNotification: ScheduleFinancialNotificationUseCase,
    private readonly cancelNotifications: CancelFinancialNotificationsUseCase,
  ) {}

  @OnEvent(FINANCIAL_RECORD_CREATED, { promisify: true })
  async onCreated(event: FinancialRecordCreatedEvent): Promise<void> {
    if (!event.date) return;
    try {
      await this.scheduleNotification.execute({
        userId: event.userId,
        financialId: event.financialId,
        date: event.date,
      });
    } catch (error) {
      this.logger.error(
        `Failed to schedule notification for ${event.financialId}: ${this.message(error)}`,
      );
    }
  }

  @OnEvent(FINANCIAL_RECORD_UPDATED, { promisify: true })
  async onUpdated(event: FinancialRecordUpdatedEvent): Promise<void> {
    if (!event.dateChanged) return;
    try {
      if (event.date) {
        await this.scheduleNotification.execute({
          userId: event.userId,
          financialId: event.financialId,
          date: event.date,
        });
      } else {
        await this.cancelNotifications.execute({
          financialId: event.financialId,
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to update notification for ${event.financialId}: ${this.message(error)}`,
      );
    }
  }

  @OnEvent(FINANCIAL_RECORD_DELETED, { promisify: true })
  async onDeleted(event: FinancialRecordDeletedEvent): Promise<void> {
    try {
      await this.cancelNotifications.execute({
        financialId: event.financialId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to cancel notifications for ${event.financialId}: ${this.message(error)}`,
      );
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
