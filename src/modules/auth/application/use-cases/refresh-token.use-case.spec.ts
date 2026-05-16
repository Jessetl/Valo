process.env.APP_ENCRYPTION_KEY ??=
  'a2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2s=';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { UnauthorizedException } from '../../../../shared-kernel/domain/exceptions/unauthorized.exception';
import { encryptString } from '../../../../shared-kernel/utils/crypto.util';
import { SubscriptionPlan, User } from '../../domain/entities/user.entity';
import { UserDevice } from '../../domain/entities/user-device.entity';
import { JwtTokenService } from '../services/jwt-token.service';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let deviceRepository: jest.Mocked<IUserDeviceRepository>;
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;
  let useCase: RefreshTokenUseCase;

  const input = { deviceId: 'dev-1', accessTokenHint: 'jwt-expired' };

  beforeEach(() => {
    userRepository = { findById: jest.fn() } as never;
    deviceRepository = {
      findByDeviceId: jest.fn(),
      save: jest.fn(),
    } as never;
    firebaseAuth = { refreshIdToken: jest.fn() } as never;
    jwtTokenService = {
      signFor: jest.fn(),
      verifyIgnoreExpiration: jest.fn(),
    } as never;

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
    jwtTokenService.verifyIgnoreExpiration.mockResolvedValue({
      sub: 'u-1',
      email: 'a@b.com',
      role: SubscriptionPlan.FREE,
    });
    deviceRepository.save.mockImplementation(async (d) => d);
  });

  it('lanza unauthorized si jwt firma invalida', async () => {
    jwtTokenService.verifyIgnoreExpiration.mockRejectedValueOnce(
      new Error('invalid signature'),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lanza unauthorized si device no existe', async () => {
    deviceRepository.findByDeviceId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lanza unauthorized si device.userId no coincide con jwt.sub', async () => {
    const encrypted = encryptString('rt-plain');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create(
        'd-1',
        'u-OTRO',
        'dev-1',
        'Pixel',
        encrypted,
        'android',
      ),
    );

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(firebaseAuth.refreshIdToken).not.toHaveBeenCalled();
  });

  it('lanza unauthorized si user del device ya no existe', async () => {
    const encrypted = encryptString('rt-plain');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create('d-1', 'u-1', 'dev-1', 'Pixel', encrypted, 'android'),
    );
    firebaseAuth.refreshIdToken.mockResolvedValue({
      idToken: 'new-id',
      refreshToken: 'rt-plain',
      expiresIn: 3600,
      firebaseUid: 'fb-uid',
    });
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rota refresh token cuando Firebase devuelve uno nuevo', async () => {
    const encrypted = encryptString('rt-old');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create('d-1', 'u-1', 'dev-1', 'Pixel', encrypted, 'android'),
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

    const result = await useCase.execute(input);

    expect(deviceRepository.save).toHaveBeenCalled();
    expect(result.access_token).toBe('jwt');
  });

  it('no rota cuando Firebase devuelve mismo refresh token', async () => {
    const encrypted = encryptString('rt-same');
    deviceRepository.findByDeviceId.mockResolvedValue(
      UserDevice.create('d-1', 'u-1', 'dev-1', 'Pixel', encrypted, 'android'),
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

    await useCase.execute(input);

    expect(deviceRepository.save).not.toHaveBeenCalled();
  });
});
