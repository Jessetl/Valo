process.env.APP_ENCRYPTION_KEY ??= 'test-encryption-key';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { UnauthorizedException } from '../../../../shared-kernel/domain/exceptions/unauthorized.exception';
import { encryptString } from '../../../../shared-kernel/utils/crypto.util';
import { User } from '../../domain/entities/user.entity';
import { UserDevice } from '../../domain/entities/user-device.entity';
import { JwtTokenService } from '../services/jwt-token.service';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let deviceRepository: jest.Mocked<IUserDeviceRepository>;
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    userRepository = { findById: jest.fn() } as never;
    deviceRepository = {
      findByDeviceId: jest.fn(),
      save: jest.fn(),
    } as never;
    firebaseAuth = { refreshIdToken: jest.fn() } as never;
    jwtTokenService = { signFor: jest.fn() } as never;

    useCase = new RefreshTokenUseCase(
      userRepository,
      deviceRepository,
      firebaseAuth,
      jwtTokenService,
    );

    jwtTokenService.signFor.mockResolvedValue({
      accessToken: 'jwt',
      expiresIn: 900,
    });
    deviceRepository.save.mockImplementation(async (d) => d);
  });

  it('lanza unauthorized si device no existe', async () => {
    deviceRepository.findByDeviceId.mockResolvedValue(null);

    await expect(
      useCase.execute({ deviceId: 'dev-1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lanza unauthorized si user del device ya no existe', async () => {
    const encrypted = encryptString('rt-plain');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create(
        'd-1',
        'u-1',
        'dev-1',
        'Pixel',
        encrypted,
        'android',
      ),
    );
    firebaseAuth.refreshIdToken.mockResolvedValue({
      idToken: 'new-id',
      refreshToken: 'rt-plain',
      expiresIn: 3600,
      firebaseUid: 'fb-uid',
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ deviceId: 'dev-1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rota refresh token cuando Firebase devuelve uno nuevo', async () => {
    const encrypted = encryptString('rt-old');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create(
        'd-1',
        'u-1',
        'dev-1',
        'Pixel',
        encrypted,
        'android',
      ),
    );
    firebaseAuth.refreshIdToken.mockResolvedValue({
      idToken: 'new-id',
      refreshToken: 'rt-rotated',
      expiresIn: 3600,
      firebaseUid: 'fb-uid',
    });
    userRepository.findById.mockResolvedValue(
      User.create('u-1', 'fb-uid', 'a@b.com', 'VE'),
    );

    const result = await useCase.execute({ deviceId: 'dev-1' });

    expect(deviceRepository.save).toHaveBeenCalled();
    expect(result.access_token).toBe('jwt');
  });

  it('no rota cuando Firebase devuelve mismo refresh token', async () => {
    const encrypted = encryptString('rt-same');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create(
        'd-1',
        'u-1',
        'dev-1',
        'Pixel',
        encrypted,
        'android',
      ),
    );
    firebaseAuth.refreshIdToken.mockResolvedValue({
      idToken: 'new-id',
      refreshToken: 'rt-same',
      expiresIn: 3600,
      firebaseUid: 'fb-uid',
    });
    userRepository.findById.mockResolvedValue(
      User.create('u-1', 'fb-uid', 'a@b.com', 'VE'),
    );

    await useCase.execute({ deviceId: 'dev-1' });

    expect(deviceRepository.save).not.toHaveBeenCalled();
  });
});
