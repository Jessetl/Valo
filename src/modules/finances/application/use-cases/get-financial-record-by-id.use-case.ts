import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { INotificationRepository } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { FinancialRecordNotFoundException } from '../../domain/exceptions/financial-record-not-found.exception';
import { FinancialRecordResponseDto } from '../dtos/financial-record-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
import { NotificationStatus } from '../../../notifications/domain/enums/notification-status.enum';

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
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
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

    const notifications = await this.notificationRepository.findByFinancialId(
      record.id,
    );
    const pending =
      notifications.find((n) => n.status === NotificationStatus.PENDING) ??
      notifications[0] ??
      null;

    return FinancialRecordMapper.toResponse(record, pending);
  }
}
