import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FinancialRecord } from '../../domain/entities/financial-record.entity';
import { ScheduleFinancialNotificationUseCase } from '../../../notifications/application/use-cases/schedule-financial-notification.use-case';
import {
  effectiveRecurrenceDate,
  monthBounds,
  startOfTodayUtc,
} from '../utils/date.util';

@Injectable()
export class GenerateRecurringFinancialRecordsUseCase implements UseCase<
  void,
  number
> {
  private readonly logger = new Logger(
    GenerateRecurringFinancialRecordsUseCase.name,
  );

  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Optional()
    private readonly scheduleNotification?: ScheduleFinancialNotificationUseCase,
  ) {}

  async execute(): Promise<number> {
    const today = startOfTodayUtc();
    const currentYear = today.getUTCFullYear();
    const currentMonth0 = today.getUTCMonth();
    const { start, end } = monthBounds(currentYear, currentMonth0);

    const templates = await this.recordRepository.findActiveRecurring();
    if (templates.length === 0) {
      return 0;
    }

    let created = 0;

    for (const template of templates) {
      if (template.recurrenceDay === null) continue;

      const target = effectiveRecurrenceDate(
        currentYear,
        currentMonth0,
        template.recurrenceDay,
      );

      if (target.getTime() > today.getTime()) continue;

      if (
        template.date.getUTCFullYear() === currentYear &&
        template.date.getUTCMonth() === currentMonth0
      ) {
        continue;
      }

      const exists = await this.recordRepository.existsForMonth({
        userId: template.userId,
        title: template.title,
        type: template.type,
        monthStart: start,
        monthEnd: end,
      });
      if (exists) continue;

      const child = FinancialRecord.create(
        randomUUID(),
        template.userId,
        template.type,
        template.title,
        template.amountLocal,
        template.amountUsd,
        target,
        {
          description: template.description,
          priority: template.priority,
          interestRate: template.interestRate,
          isRecurring: false,
          recurrenceDay: null,
        },
      );

      const saved = await this.recordRepository.save(child);
      created++;

      if (this.scheduleNotification) {
        try {
          await this.scheduleNotification.execute({
            userId: saved.userId,
            financialId: saved.id,
            date: saved.date,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to schedule notification for recurring ${saved.id}: ${message}`,
          );
        }
      }
    }

    return created;
  }
}
