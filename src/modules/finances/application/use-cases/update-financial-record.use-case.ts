import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { INotificationRepository } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';
import { UpdateFinancialRecordDto } from '../dtos/update-financial-record.dto';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
import { ScheduleFinancialNotificationUseCase } from '../../../notifications/application/use-cases/schedule-financial-notification.use-case';
import { CancelFinancialNotificationsUseCase } from '../../../notifications/application/use-cases/cancel-financial-notifications.use-case';
import { NotificationStatus } from '../../../notifications/domain/enums/notification-status.enum';
import { parseDateOnly } from '../utils/date.util';

interface UpdateFinancialRecordInput {
  userId: string;
  recordId: string;
  dto: UpdateFinancialRecordDto;
}

@Injectable()
export class UpdateFinancialRecordUseCase implements UseCase<
  UpdateFinancialRecordInput,
  FinancialRecordResponseDto
> {
  private readonly logger = new Logger(UpdateFinancialRecordUseCase.name);

  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Optional()
    private readonly scheduleNotification?: ScheduleFinancialNotificationUseCase,
    @Optional()
    private readonly cancelNotifications?: CancelFinancialNotificationsUseCase,
  ) {}

  async execute(
    input: UpdateFinancialRecordInput,
  ): Promise<FinancialRecordResponseDto> {
    const existing = await this.recordRepository.findByIdAndUserId(
      input.recordId,
      input.userId,
    );

    if (!existing) {
      throw new FinancialRecordNotFoundException(input.recordId);
    }

    const dto = input.dto;
    const dateKey: keyof UpdateFinancialRecordDto = 'date';
    const dateProvided = dateKey in dto;
    const parsedDate =
      dateProvided && dto.date ? parseDateOnly(dto.date) : null;

    const updated = existing.update({
      type: dto.type,
      title: dto.title,
      description: dto.description !== undefined ? dto.description : undefined,
      amountLocal: dto.amount_local,
      amountUsd: dto.amount_usd,
      priority: dto.priority !== undefined ? dto.priority : undefined,
      interestRate:
        dto.interest_rate !== undefined ? dto.interest_rate : undefined,
      date: dateProvided && parsedDate ? parsedDate : undefined,
      isRecurring: dto.is_recurring,
      recurrenceDay:
        dto.recurrence_day !== undefined ? dto.recurrence_day : undefined,
    });

    const saved = await this.recordRepository.save(updated);

    if (dateProvided) {
      try {
        if (dto.date && this.scheduleNotification) {
          await this.scheduleNotification.execute({
            userId: saved.userId,
            financialId: saved.id,
            date: saved.date,
          });
        } else if (!dto.date && this.cancelNotifications) {
          await this.cancelNotifications.execute({ financialId: saved.id });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to update notification: ${message}`);
      }
    }

    const notifications = await this.notificationRepository.findByFinancialId(
      saved.id,
    );
    const pending =
      notifications.find((n) => n.status === NotificationStatus.PENDING) ??
      null;

    return FinancialRecordMapper.toResponse(saved, pending);
  }
}
