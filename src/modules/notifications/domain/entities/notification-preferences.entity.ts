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
      priceAlerts: true,
      listReminders: true,
      updatedAt: new Date(),
    });
  }

  updateFields(partial: {
    pushEnabled?: boolean | null;
    debtReminders?: boolean | null;
    priceAlerts?: boolean | null;
    listReminders?: boolean | null;
  }): NotificationPreferences {
    return new NotificationPreferences(this.id, {
      userId: this.userId,
      pushEnabled:
        partial.pushEnabled !== undefined && partial.pushEnabled !== null
          ? partial.pushEnabled
          : this.pushEnabled,
      debtReminders:
        partial.debtReminders !== undefined && partial.debtReminders !== null
          ? partial.debtReminders
          : this.debtReminders,
      priceAlerts:
        partial.priceAlerts !== undefined && partial.priceAlerts !== null
          ? partial.priceAlerts
          : this.priceAlerts,
      listReminders:
        partial.listReminders !== undefined && partial.listReminders !== null
          ? partial.listReminders
          : this.listReminders,
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
