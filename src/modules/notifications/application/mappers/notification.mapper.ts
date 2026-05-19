import { Notification } from '../../domain/entities/notification.entity';
import { NotificationResponseDto } from '../dtos/notification-response.dto';

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
}
