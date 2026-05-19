import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { INotificationRepository } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { FinancialRecord } from '../../domain/entities/financial-record.entity';
import { CreateFinancialRecordDto } from '../dtos/create-financial-record.dto';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
import { ScheduleFinancialNotificationUseCase } from '../../../notifications/application/use-cases/schedule-financial-notification.use-case';
import { parseDateOnly } from '../utils/date.util';

interface CreateFinancialRecordInput {
  userId: string;
  dto: CreateFinancialRecordDto;
}

@Injectable()
export class CreateFinancialRecordUseCase implements UseCase<
  CreateFinancialRecordInput,
  FinancialRecordResponseDto
> {
  private readonly logger = new Logger(CreateFinancialRecordUseCase.name);

  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    @Optional()
    private readonly scheduleNotification?: ScheduleFinancialNotificationUseCase,
  ) {}

  async execute(
    input: CreateFinancialRecordInput,
  ): Promise<FinancialRecordResponseDto> {
    const { dto } = input;

    const record = FinancialRecord.create(
      randomUUID(),
      input.userId,
      dto.type,
      dto.title,
      dto.amount_local,
      dto.amount_usd,
      parseDateOnly(dto.date),
      {
        description: dto.description ?? null,
        priority: dto.priority ?? null,
        interestRate: dto.interest_rate ?? null,
        isRecurring: dto.is_recurring ?? false,
        recurrenceDay: dto.recurrence_day ?? null,
      },
    );

    const saved = await this.recordRepository.save(record);

    let notificationId: string | null = null;
    if (this.scheduleNotification) {
      try {
        const scheduled = await this.scheduleNotification.execute({
          userId: saved.userId,
          financialId: saved.id,
          date: saved.date,
        });
        notificationId = scheduled?.id ?? null;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to schedule notification: ${message}`);
      }
    }

    const notification = notificationId
      ? await this.notificationRepository.findById(notificationId)
      : null;

    return FinancialRecordMapper.toResponse(saved, notification);
  }
}
