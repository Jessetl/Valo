export const USER_DEVICE_READER = Symbol('USER_DEVICE_READER');

export interface IUserDeviceReader {
  findFcmTokensByUserId(userId: string): Promise<string[]>;
}
