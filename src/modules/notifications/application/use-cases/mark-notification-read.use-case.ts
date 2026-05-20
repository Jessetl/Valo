import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type { IFinancialRecordReader } from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import { FINANCIAL_RECORD_READER } from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import { NotificationNotFoundException } from '../../domain/exceptions/notification-not-found.exception';
import { NotificationListItemDto } from '../dtos/notification-list-item.dto';
import { NotificationMapper } from '../mappers/notification.mapper';

interface MarkNotificationReadInput {
  userId: string;
  notificationId: string;
}

@Injectable()
export class MarkNotificationReadUseCase
  implements UseCase<MarkNotificationReadInput, NotificationListItemDto>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
    @Inject(FINANCIAL_RECORD_READER)
    private readonly financialReader: IFinancialRecordReader,
  ) {}

  async execute(
    input: MarkNotificationReadInput,
  ): Promise<NotificationListItemDto> {
    const notification = await this.repo.findByIdAndUserId(
      input.notificationId,
      input.userId,
    );
    if (!notification) {
      throw new NotificationNotFoundException(input.notificationId);
    }

    const updated = notification.markAsRead();
    const saved =
      updated === notification ? notification : await this.repo.save(updated);

    const record = await this.financialReader.findById(saved.financialId);
    if (!record) {
      throw new NotificationNotFoundException(input.notificationId);
    }

    return NotificationMapper.toListItem(saved, record);
  }
}
