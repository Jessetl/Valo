import { Notification } from '../../entities/notification.entity';
import { NotificationStatus } from '../../enums/notification-status.enum';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface SearchNotificationsFilters {
  isRead?: boolean | null;
  status?: NotificationStatus | null;
  type?: string | null;
  scheduledDateFrom?: Date | null;
  scheduledDateTo?: Date | null;
}

export interface SearchNotificationsParams {
  userId: string;
  page: number;
  limit: number;
  filters?: SearchNotificationsFilters;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
}

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Notification | null>;
  findPendingBefore(date: Date): Promise<Notification[]>;
  findByFinancialId(financialId: string): Promise<Notification[]>;
  findByFinancialIds(financialIds: string[]): Promise<Notification[]>;
  search(params: SearchNotificationsParams): Promise<PaginatedNotifications>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAllAsReadByUserId(userId: string): Promise<number>;
  save(notification: Notification): Promise<Notification>;
  deleteById(id: string): Promise<void>;
  deleteByFinancialId(financialId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
