import { NotificationPreferences } from '../../../domain/entities/notification-preferences.entity';
import { NotificationPreferencesOrmEntity } from '../orm-entities/notification-preferences.orm-entity';

export class NotificationPreferencesPersistenceMapper {
  static toDomain(
    orm: NotificationPreferencesOrmEntity,
  ): NotificationPreferences {
    return NotificationPreferences.reconstitute(orm.id, {
      userId: orm.userId,
      pushEnabled: orm.pushEnabled,
      debtReminders: orm.debtReminders,
      priceAlerts: orm.priceAlerts,
      listReminders: orm.listReminders,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(
    prefs: NotificationPreferences,
  ): NotificationPreferencesOrmEntity {
    const orm = new NotificationPreferencesOrmEntity();
    orm.id = prefs.id;
    orm.userId = prefs.userId;
    orm.pushEnabled = prefs.pushEnabled;
    orm.debtReminders = prefs.debtReminders;
    orm.priceAlerts = prefs.priceAlerts;
    orm.listReminders = prefs.listReminders;
    orm.updatedAt = prefs.updatedAt;
    return orm;
  }
}
