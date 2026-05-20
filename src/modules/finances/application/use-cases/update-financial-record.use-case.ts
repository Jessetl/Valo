import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { IFinancialNotificationReader } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { FINANCIAL_NOTIFICATION_READER } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import {
  FINANCIAL_RECORD_UPDATED,
  FinancialRecordUpdatedEvent,
} from '../../../../shared-kernel/domain/events/financial-record.events';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';
import { UpdateFinancialRecordDto } from '../dtos/update-financial-record.dto';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
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
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(FINANCIAL_NOTIFICATION_READER)
    private readonly notificationReader: IFinancialNotificationReader,
    private readonly eventEmitter: EventEmitter2,
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

    await this.eventEmitter.emitAsync(
      FINANCIAL_RECORD_UPDATED,
      new FinancialRecordUpdatedEvent(
        saved.id,
        saved.userId,
        dateProvided,
        dateProvided ? parsedDate : null,
      ),
    );

    const notification = await this.notificationReader.findActiveByFinancialId(
      saved.id,
    );

    return FinancialRecordMapper.toResponse(saved, notification);
  }
}
