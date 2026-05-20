import { FinancialRecord } from '../../domain/entities/financial-record.entity';
import { FinancialNotificationView } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import {
  FinancialRecordNotificationDto,
  FinancialRecordResponseDto,
} from '../dtos/financial-record-response.dto';
import { FinancialRecordSummaryItemDto } from '../dtos/search-financial-records-response.dto';
import { FinancialSummaryUpcomingExpenseDto } from '../dtos/financial-summary-response.dto';

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class FinancialRecordMapper {
  static toResponse(
    record: FinancialRecord,
    notification: FinancialNotificationView | null,
  ): FinancialRecordResponseDto {
    const dto = new FinancialRecordResponseDto();
    dto.id = record.id;
    dto.user_id = record.userId;
    dto.type = record.type;
    dto.title = record.title;
    dto.description = record.description;
    dto.amount_local = record.amountLocal;
    dto.amount_usd = record.amountUsd;
    dto.priority = record.priority;
    dto.interest_rate = record.interestRate;
    dto.date = toDateOnly(record.date);
    dto.is_recurring = record.isRecurring;
    dto.recurrence_day = record.recurrenceDay;
    dto.notification = notification
      ? this.toNotificationDto(notification)
      : null;
    return dto;
  }

  static toNotificationDto(
    notification: FinancialNotificationView,
  ): FinancialRecordNotificationDto {
    const dto = new FinancialRecordNotificationDto();
    dto.id = notification.id;
    dto.scheduled_at = toDateOnly(notification.scheduledAt);
    dto.sent_at = notification.sentAt ? toDateOnly(notification.sentAt) : null;
    dto.status = notification.status;
    return dto;
  }

  static toSummaryItem(
    record: FinancialRecord,
    notification: FinancialNotificationView | null,
  ): FinancialRecordSummaryItemDto {
    const dto = new FinancialRecordSummaryItemDto();
    dto.id = record.id;
    dto.type = record.type;
    dto.title = record.title;
    dto.amount_local = record.amountLocal;
    dto.amount_usd = record.amountUsd;
    dto.priority = record.priority;
    dto.date = toDateOnly(record.date);
    dto.is_recurring = record.isRecurring;
    dto.notification_status = notification ? notification.status : null;
    return dto;
  }

  static toUpcomingExpense(
    record: FinancialRecord,
  ): FinancialSummaryUpcomingExpenseDto {
    const dto = new FinancialSummaryUpcomingExpenseDto();
    dto.id = record.id;
    dto.title = record.title;
    dto.amount_local = record.amountLocal;
    dto.amount_usd = record.amountUsd;
    dto.date = toDateOnly(record.date);
    dto.priority = record.priority;
    return dto;
  }
}
