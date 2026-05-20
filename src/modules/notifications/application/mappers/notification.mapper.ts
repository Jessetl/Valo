import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import {
  FinancialRecordSummaryDto,
  NotificationListItemDto,
} from '../dtos/notification-list-item.dto';
import type { FinancialRecordView } from '../../../../shared-kernel/application/ports/financial-record-reader.port';

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class NotificationMapper {
  static toResponse(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.user_id = notification.userId;
    dto.financial_id = notification.financialId;
    dto.type = notification.type;
    dto.scheduled_at = toDateOnly(notification.scheduledAt);
    dto.sent_at = notification.sentAt ? toDateOnly(notification.sentAt) : null;
    dto.status = notification.status;
    dto.is_read = notification.isRead;
    return dto;
  }

  static toListItem(
    notification: Notification,
    financialRecord: FinancialRecordView,
  ): NotificationListItemDto {
    const dto = new NotificationListItemDto();
    dto.id = notification.id;
    dto.type = notification.type;
    dto.scheduled_at = toDateOnly(notification.scheduledAt);
    dto.sent_at = notification.sentAt ? toDateOnly(notification.sentAt) : null;
    dto.status = notification.status;
    dto.is_read = notification.isRead;
    dto.financial_record = this.toFinancialSummary(financialRecord);
    return dto;
  }

  private static toFinancialSummary(
    record: FinancialRecordView,
  ): FinancialRecordSummaryDto {
    const dto = new FinancialRecordSummaryDto();
    dto.id = record.id;
    dto.title = record.title;
    dto.type = record.type;
    dto.amount_local = record.amountLocal;
    dto.amount_usd = record.amountUsd;
    dto.date = toDateOnly(record.date);
    return dto;
  }
}
