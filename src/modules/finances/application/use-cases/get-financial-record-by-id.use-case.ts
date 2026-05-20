import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { IFinancialNotificationReader } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { FINANCIAL_NOTIFICATION_READER } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';

interface GetFinancialRecordByIdInput {
  userId: string;
  recordId: string;
}

@Injectable()
export class GetFinancialRecordByIdUseCase implements UseCase<
  GetFinancialRecordByIdInput,
  FinancialRecordResponseDto
> {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(FINANCIAL_NOTIFICATION_READER)
    private readonly notificationReader: IFinancialNotificationReader,
  ) {}

  async execute(
    input: GetFinancialRecordByIdInput,
  ): Promise<FinancialRecordResponseDto> {
    const record = await this.recordRepository.findByIdAndUserId(
      input.recordId,
      input.userId,
    );

    if (!record) {
      throw new FinancialRecordNotFoundException(input.recordId);
    }

    const notification = await this.notificationReader.findActiveByFinancialId(
      record.id,
    );

    return FinancialRecordMapper.toResponse(record, notification);
  }
}
