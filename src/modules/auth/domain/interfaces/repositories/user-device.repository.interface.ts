import { UserDevice } from '../../entities/user-device.entity';

export const USER_DEVICE_REPOSITORY = Symbol('USER_DEVICE_REPOSITORY');

export interface IUserDeviceRepository {
  findByDeviceId(deviceId: string): Promise<UserDevice | null>;
  findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<UserDevice | null>;
  save(device: UserDevice): Promise<UserDevice>;
  delete(id: string): Promise<void>;
  deleteByUserIdExceptDevice(
    userId: string,
    keepDeviceId: string,
  ): Promise<void>;
}
