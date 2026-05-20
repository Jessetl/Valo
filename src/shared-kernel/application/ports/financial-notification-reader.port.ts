import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export const FINANCIAL_NOTIFICATION_READER = Symbol(
  'FINANCIAL_NOTIFICATION_READER',
);

export interface FinancialNotificationView {
  id: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: NotificationStatus;
}

export interface IFinancialNotificationReader {
  findActiveByFinancialId(
    financialId: string,
  ): Promise<FinancialNotificationView | null>;

  findActiveByFinancialIds(
    financialIds: string[],
  ): Promise<Map<string, FinancialNotificationView>>;
}
