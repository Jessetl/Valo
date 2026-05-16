import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';

export enum SubscriptionPlan {
  FREE = 'FREE',
}

interface UserProps {
  firebaseUid: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  subscriptionPlan: SubscriptionPlan;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  fcmToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseEntity {
  readonly firebaseUid: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly avatarUrl: string | null;
  readonly subscriptionPlan: SubscriptionPlan;
  readonly countryCode: string;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly fcmToken: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(id: string, props: UserProps) {
    super(id);
    this.firebaseUid = props.firebaseUid;
    this.email = props.email;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.avatarUrl = props.avatarUrl;
    this.subscriptionPlan = props.subscriptionPlan;
    this.countryCode = props.countryCode;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.fcmToken = props.fcmToken;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    id: string,
    firebaseUid: string,
    email: string,
    countryCode: string,
    firstName: string | null = null,
    lastName: string | null = null,
    avatarUrl: string | null = null,
    latitude: number | null = null,
    longitude: number | null = null,
  ): User {
    const now = new Date();
    return new User(id, {
      firebaseUid,
      email,
      firstName,
      lastName,
      avatarUrl,
      subscriptionPlan: SubscriptionPlan.FREE,
      countryCode,
      latitude,
      longitude,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateProfile(props: {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    countryCode?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): User {
    return new User(this.id, {
      firebaseUid: this.firebaseUid,
      email: this.email,
      firstName:
        props.firstName !== undefined ? props.firstName : this.firstName,
      lastName: props.lastName !== undefined ? props.lastName : this.lastName,
      avatarUrl:
        props.avatarUrl !== undefined ? props.avatarUrl : this.avatarUrl,
      subscriptionPlan: this.subscriptionPlan,
      countryCode: props.countryCode ?? this.countryCode,
      latitude: props.latitude !== undefined ? props.latitude : this.latitude,
      longitude:
        props.longitude !== undefined ? props.longitude : this.longitude,
      fcmToken: this.fcmToken,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  static reconstitute(id: string, props: UserProps): User {
    return new User(id, props);
  }
}
