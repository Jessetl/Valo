import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import {
  FINANCIAL_RECORD_DELETED,
  FinancialRecordDeletedEvent,
} from '../../../../shared-kernel/domain/events/financial-record.events';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';

interface DeleteFinancialRecordInput {
  userId: string;
  recordId: string;
}

@Injectable()
export class DeleteFinancialRecordUseCase implements UseCase<
  DeleteFinancialRecordInput,
  void
> {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: DeleteFinancialRecordInput): Promise<void> {
    const existing = await this.recordRepository.findByIdAndUserId(
      input.recordId,
      input.userId,
    );

    if (!existing) {
      throw new FinancialRecordNotFoundException(input.recordId);
    }

    await this.eventEmitter.emitAsync(
      FINANCIAL_RECORD_DELETED,
      new FinancialRecordDeletedEvent(existing.id, existing.userId),
    );

    await this.recordRepository.delete(existing.id);
  }
}
