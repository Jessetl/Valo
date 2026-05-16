import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';

interface NotificationPreferencesProps {
  userId: string;
  pushEnabled: boolean;
  debtReminders: boolean;
  priceAlerts: boolean;
  listReminders: boolean;
  updatedAt: Date;
}

export class NotificationPreferences extends BaseEntity {
  readonly userId: string;
  readonly pushEnabled: boolean;
  readonly debtReminders: boolean;
  readonly priceAlerts: boolean;
  readonly listReminders: boolean;
  readonly updatedAt: Date;

  private constructor(id: string, props: NotificationPreferencesProps) {
    super(id);
    this.userId = props.userId;
    this.pushEnabled = props.pushEnabled;
    this.debtReminders = props.debtReminders;
    this.priceAlerts = props.priceAlerts;
    this.listReminders = props.listReminders;
    this.updatedAt = props.updatedAt;
  }

  static createDefault(id: string, userId: string): NotificationPreferences {
    return new NotificationPreferences(id, {
      userId,
      pushEnabled: true,
      debtReminders: true,
      priceAlerts: false,
      listReminders: true,
      updatedAt: new Date(),
    });
  }

  static reconstitute(
    id: string,
    props: NotificationPreferencesProps,
  ): NotificationPreferences {
    return new NotificationPreferences(id, props);
  }
}
