import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { IFinancialNotificationReader } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { FINANCIAL_NOTIFICATION_READER } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import {
  FINANCIAL_RECORD_CREATED,
  FinancialRecordCreatedEvent,
} from '../../../../shared-kernel/domain/events/financial-record.events';
import { FinancialRecord } from '../../domain/entities/financial-record.entity';
import { CreateFinancialRecordDto } from '../dtos/create-financial-record.dto';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
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
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(FINANCIAL_NOTIFICATION_READER)
    private readonly notificationReader: IFinancialNotificationReader,
    private readonly eventEmitter: EventEmitter2,
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
      dto.amountUsd,
      dto.date ? parseDateOnly(dto.date) : null,
      {
        description: dto.description ?? null,
        priority: dto.priority ?? null,
        interestRate: dto.interestRate ?? null,
        isRecurring: dto.isRecurring ?? false,
        recurrenceDay: dto.recurrenceDay ?? null,
      },
    );

    const saved = await this.recordRepository.save(record);

    if (saved.date) {
      await this.eventEmitter.emitAsync(
        FINANCIAL_RECORD_CREATED,
        new FinancialRecordCreatedEvent(saved.id, saved.userId, saved.date),
      );
    }

    const notification = await this.notificationReader.findActiveByFinancialId(
      saved.id,
    );

    return FinancialRecordMapper.toResponse(saved, notification);
  }
}
