import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';

interface UserDeviceProps {
  userId: string;
  deviceId: string;
  deviceName: string;
  fcmToken: string | null;
  refreshTokenEncrypted: string;
  platform: string;
  appVersion: string | null;
  lastActiveAt: Date;
  createdAt: Date;
}

export class UserDevice extends BaseEntity {
  readonly userId: string;
  readonly deviceId: string;
  readonly deviceName: string;
  readonly fcmToken: string | null;
  readonly refreshTokenEncrypted: string;
  readonly platform: string;
  readonly appVersion: string | null;
  readonly lastActiveAt: Date;
  readonly createdAt: Date;

  private constructor(id: string, props: UserDeviceProps) {
    super(id);
    this.userId = props.userId;
    this.deviceId = props.deviceId;
    this.deviceName = props.deviceName;
    this.fcmToken = props.fcmToken;
    this.refreshTokenEncrypted = props.refreshTokenEncrypted;
    this.platform = props.platform;
    this.appVersion = props.appVersion;
    this.lastActiveAt = props.lastActiveAt;
    this.createdAt = props.createdAt;
  }

  static create(
    id: string,
    userId: string,
    deviceId: string,
    deviceName: string,
    refreshTokenEncrypted: string,
    platform: string,
    fcmToken: string | null = null,
    appVersion: string | null = null,
  ): UserDevice {
    const now = new Date();
    return new UserDevice(id, {
      userId,
      deviceId,
      deviceName,
      fcmToken,
      refreshTokenEncrypted,
      platform,
      appVersion,
      lastActiveAt: now,
      createdAt: now,
    });
  }

  rotateRefreshToken(refreshTokenEncrypted: string): UserDevice {
    return new UserDevice(this.id, {
      userId: this.userId,
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      fcmToken: this.fcmToken,
      refreshTokenEncrypted,
      platform: this.platform,
      appVersion: this.appVersion,
      lastActiveAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  reassignToUser(
    userId: string,
    deviceName: string,
    refreshTokenEncrypted: string,
    platform: string,
    fcmToken: string | null,
    appVersion: string | null,
  ): UserDevice {
    return new UserDevice(this.id, {
      userId,
      deviceId: this.deviceId,
      deviceName,
      fcmToken,
      refreshTokenEncrypted,
      platform,
      appVersion,
      lastActiveAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  static reconstitute(id: string, props: UserDeviceProps): UserDevice {
    return new UserDevice(id, props);
  }
}
