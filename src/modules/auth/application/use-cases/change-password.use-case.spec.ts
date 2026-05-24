process.env.APP_ENCRYPTION_KEY ??=
  'a2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2s=';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { ChangePasswordUseCase } from './change-password.use-case';

describe('ChangePasswordUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let deviceRepository: jest.Mocked<IUserDeviceRepository>;
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let useCase: ChangePasswordUseCase;

  const device = {
    deviceId: 'dev-1',
    deviceName: 'Pixel',
    fcmToken: null,
  };

  const user = User.create('u-1', 'fb-uid', 'jane@kashy.app', 'VE');

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as never;
    deviceRepository = {
      findByDeviceId: jest.fn(),
      save: jest.fn(),
      deleteByUserIdExceptDevice: jest.fn(),
    } as never;
    firebaseAuth = {
      signIn: jest.fn(),
      updatePassword: jest.fn(),
      revokeRefreshTokens: jest.fn(),
    } as never;

    useCase = new ChangePasswordUseCase(
      userRepository,
      deviceRepository,
      firebaseAuth,
    );

    userRepository.findById.mockResolvedValue(user);
    firebaseAuth.signIn.mockResolvedValue({
      firebaseUid: 'fb-uid',
      idToken: 'id',
      refreshToken: 'rt-new',
      expiresIn: 3600,
      email: user.email,
    });
    deviceRepository.findByDeviceId.mockResolvedValue(null);
    deviceRepository.save.mockImplementation(async (d) => d);
  });

  it('lanza UserNotFoundException si user no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'u-1',
        dto: { currentPassword: 'a', newPassword: 'b' } as never,
        device,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('propaga error si currentPassword invalido', async () => {
    firebaseAuth.signIn.mockRejectedValueOnce(
      new UnauthorizedException('Credenciales invalidas'),
    );

    await expect(
      useCase.execute({
        userId: 'u-1',
        dto: { currentPassword: 'wrong', newPassword: 'b' } as never,
        device,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(firebaseAuth.updatePassword).not.toHaveBeenCalled();
  });

  it('ejecuta secuencia: verify → update → revoke → delete devices → re-signin → upsert', async () => {
    await useCase.execute({
      userId: 'u-1',
      dto: { currentPassword: 'old', newPassword: 'new' } as never,
      device,
    });

    expect(firebaseAuth.signIn).toHaveBeenNthCalledWith(1, {
      email: user.email,
      password: 'old',
    });
    expect(firebaseAuth.updatePassword).toHaveBeenCalledWith('fb-uid', 'new');
    expect(firebaseAuth.revokeRefreshTokens).toHaveBeenCalledWith('fb-uid');
    expect(deviceRepository.deleteByUserIdExceptDevice).toHaveBeenCalledWith(
      'u-1',
      'dev-1',
    );
    expect(firebaseAuth.signIn).toHaveBeenNthCalledWith(2, {
      email: user.email,
      password: 'new',
    });
    expect(deviceRepository.save).toHaveBeenCalled();
  });
});
