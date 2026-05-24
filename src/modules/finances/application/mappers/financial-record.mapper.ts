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
    dto.userId = record.userId;
    dto.type = record.type;
    dto.title = record.title;
    dto.description = record.description;
    dto.amountLocal = record.amountLocal;
    dto.amountUsd = record.amountUsd;
    dto.priority = record.priority;
    dto.interestRate = record.interestRate;
    dto.date = record.date ? toDateOnly(record.date) : null;
    dto.isRecurring = record.isRecurring;
    dto.recurrenceDay = record.recurrenceDay;
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
    dto.scheduledAt = toDateOnly(notification.scheduledAt);
    dto.sentAt = notification.sentAt ? toDateOnly(notification.sentAt) : null;
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
    dto.amountLocal = record.amountLocal;
    dto.amountUsd = record.amountUsd;
    dto.priority = record.priority;
    dto.date = record.date ? toDateOnly(record.date) : null;
    dto.isRecurring = record.isRecurring;
    dto.notificationStatus = notification ? notification.status : null;
    return dto;
  }

  static toUpcomingExpense(
    record: FinancialRecord,
  ): FinancialSummaryUpcomingExpenseDto {
    const dto = new FinancialSummaryUpcomingExpenseDto();
    dto.id = record.id;
    dto.title = record.title;
    dto.amountLocal = record.amountLocal;
    dto.amountUsd = record.amountUsd;
    dto.date = record.date ? toDateOnly(record.date) : null;
    dto.priority = record.priority;
    return dto;
  }
}
