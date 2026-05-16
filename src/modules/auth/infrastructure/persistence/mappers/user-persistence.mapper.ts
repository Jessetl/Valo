import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../orm-entities/user.orm-entity';

export class UserPersistenceMapper {
  static toDomain(orm: UserOrmEntity, fcmToken: string | null = null): User {
    return User.reconstitute(orm.id, {
      firebaseUid: orm.firebaseUid,
      email: orm.email,
      firstName: orm.firstName,
      lastName: orm.lastName,
      avatarUrl: orm.avatarUrl,
      subscriptionPlan: orm.subscriptionPlan,
      countryCode: orm.countryCode,
      latitude: orm.latitude === null ? null : Number(orm.latitude),
      longitude: orm.longitude === null ? null : Number(orm.longitude),
      fcmToken,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.firebaseUid = user.firebaseUid;
    orm.email = user.email;
    orm.firstName = user.firstName;
    orm.lastName = user.lastName;
    orm.avatarUrl = user.avatarUrl;
    orm.subscriptionPlan = user.subscriptionPlan;
    orm.countryCode = user.countryCode;
    orm.latitude = user.latitude;
    orm.longitude = user.longitude;
    orm.createdAt = user.createdAt;
    orm.updatedAt = user.updatedAt;
    return orm;
  }
}
