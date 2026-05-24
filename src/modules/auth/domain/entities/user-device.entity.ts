import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';

interface UserDeviceProps {
  userId: string;
  deviceId: string;
  deviceName: string;
  fcmToken: string | null;
  refreshTokenEncrypted: string;
  lastActiveAt: Date;
  createdAt: Date;
}

export class UserDevice extends BaseEntity {
  readonly userId: string;
  readonly deviceId: string;
  readonly deviceName: string;
  readonly fcmToken: string | null;
  readonly refreshTokenEncrypted: string;
  readonly lastActiveAt: Date;
  readonly createdAt: Date;

  private constructor(id: string, props: UserDeviceProps) {
    super(id);
    this.userId = props.userId;
    this.deviceId = props.deviceId;
    this.deviceName = props.deviceName;
    this.fcmToken = props.fcmToken;
    this.refreshTokenEncrypted = props.refreshTokenEncrypted;
    this.lastActiveAt = props.lastActiveAt;
    this.createdAt = props.createdAt;
  }

  static create(
    id: string,
    userId: string,
    deviceId: string,
    deviceName: string,
    refreshTokenEncrypted: string,
    fcmToken: string | null = null,
  ): UserDevice {
    const now = new Date();
    return new UserDevice(id, {
      userId,
      deviceId,
      deviceName,
      fcmToken,
      refreshTokenEncrypted,
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
      lastActiveAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  reassignToUser(
    userId: string,
    deviceName: string,
    refreshTokenEncrypted: string,
    fcmToken: string | null,
  ): UserDevice {
    return new UserDevice(this.id, {
      userId,
      deviceId: this.deviceId,
      deviceName,
      fcmToken,
      refreshTokenEncrypted,
      lastActiveAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  static reconstitute(id: string, props: UserDeviceProps): UserDevice {
    return new UserDevice(id, props);
  }
}
