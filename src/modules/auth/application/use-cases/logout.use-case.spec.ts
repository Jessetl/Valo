process.env.APP_ENCRYPTION_KEY ??= 'test-encryption-key';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { UserDevice } from '../../domain/entities/user-device.entity';
import { DeviceNotFoundException } from '../../domain/exceptions/device-not-found.exception';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let deviceRepository: jest.Mocked<IUserDeviceRepository>;
  let useCase: LogoutUseCase;

  beforeEach(() => {
    deviceRepository = {
      findByUserIdAndDeviceId: jest.fn(),
      delete: jest.fn(),
    } as never;
    useCase = new LogoutUseCase(deviceRepository);
  });

  it('lanza DeviceNotFoundException si no existe device para user', async () => {
    deviceRepository.findByUserIdAndDeviceId.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'u-1', deviceId: 'dev-1' }),
    ).rejects.toBeInstanceOf(DeviceNotFoundException);

    expect(deviceRepository.delete).not.toHaveBeenCalled();
  });

  it('elimina device cuando existe para el user', async () => {
    const device = UserDevice.create(
      'd-1',
      'u-1',
      'dev-1',
      'Pixel',
      'enc',
      'android',
    );
    deviceRepository.findByUserIdAndDeviceId.mockResolvedValue(device);

    await useCase.execute({ userId: 'u-1', deviceId: 'dev-1' });

    expect(deviceRepository.findByUserIdAndDeviceId).toHaveBeenCalledWith(
      'u-1',
      'dev-1',
    );
    expect(deviceRepository.delete).toHaveBeenCalledWith('d-1');
  });
});
