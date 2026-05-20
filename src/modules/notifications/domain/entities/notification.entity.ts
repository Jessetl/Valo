import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';
import { NotificationStatus } from '../enums/notification-status.enum';

interface NotificationProps {
  userId: string;
  financialId: string;
  type: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: NotificationStatus;
  isRead: boolean;
}

export class Notification extends BaseEntity {
  readonly userId: string;
  readonly financialId: string;
  readonly type: string;
  readonly scheduledAt: Date;
  readonly sentAt: Date | null;
  readonly status: NotificationStatus;
  readonly isRead: boolean;

  private constructor(id: string, props: NotificationProps) {
    super(id);
    this.userId = props.userId;
    this.financialId = props.financialId;
    this.type = props.type;
    this.scheduledAt = props.scheduledAt;
    this.sentAt = props.sentAt;
    this.status = props.status;
    this.isRead = props.isRead;
  }

  static create(
    id: string,
    userId: string,
    financialId: string,
    scheduledAt: Date,
    type: string = 'financial_due_reminder',
  ): Notification {
    return new Notification(id, {
      userId,
      financialId,
      type,
      scheduledAt,
      sentAt: null,
      status: NotificationStatus.PENDING,
      isRead: false,
    });
  }

  markAsSent(): Notification {
    return new Notification(this.id, {
      userId: this.userId,
      financialId: this.financialId,
      type: this.type,
      scheduledAt: this.scheduledAt,
      sentAt: new Date(),
      status: NotificationStatus.SENT,
      isRead: this.isRead,
    });
  }

  markAsFailed(): Notification {
    return new Notification(this.id, {
      userId: this.userId,
      financialId: this.financialId,
      type: this.type,
      scheduledAt: this.scheduledAt,
      sentAt: null,
      status: NotificationStatus.FAILED,
      isRead: this.isRead,
    });
  }

  markAsRead(): Notification {
    if (this.isRead) return this;
    return new Notification(this.id, {
      userId: this.userId,
      financialId: this.financialId,
      type: this.type,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      status: this.status,
      isRead: true,
    });
  }

  static reconstitute(id: string, props: NotificationProps): Notification {
    return new Notification(id, props);
  }
}
