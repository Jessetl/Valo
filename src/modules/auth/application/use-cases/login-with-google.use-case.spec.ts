process.env.APP_ENCRYPTION_KEY ??= 'test-encryption-key';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { User } from '../../domain/entities/user.entity';
import { JwtTokenService } from '../services/jwt-token.service';
import { LoginWithGoogleUseCase } from './login-with-google.use-case';

describe('LoginWithGoogleUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let prefsRepository: jest.Mocked<INotificationPreferencesRepository>;
  let deviceRepository: jest.Mocked<IUserDeviceRepository>;
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;
  let useCase: LoginWithGoogleUseCase;

  const device = {
    deviceId: 'dev-1',
    deviceName: 'Pixel',
    fcmToken: null,
    platform: 'android',
    appVersion: null,
  };

  beforeEach(() => {
    userRepository = {
      findByFirebaseUid: jest.fn(),
      save: jest.fn(),
    } as never;
    prefsRepository = { save: jest.fn() } as never;
    deviceRepository = {
      findByDeviceId: jest.fn(),
      save: jest.fn(),
    } as never;
    firebaseAuth = { signInWithGoogle: jest.fn() } as never;
    jwtTokenService = { signFor: jest.fn() } as never;

    useCase = new LoginWithGoogleUseCase(
      userRepository,
      prefsRepository,
      deviceRepository,
      firebaseAuth,
      jwtTokenService,
    );

    firebaseAuth.signInWithGoogle.mockResolvedValue({
      firebaseUid: 'fb-uid',
      idToken: 'id',
      refreshToken: 'rt',
      expiresIn: 3600,
      email: 'jane@kashy.app',
      emailVerified: true,
      firstName: 'Jane',
      lastName: 'Doe',
      avatarUrl: 'https://photo',
    });
    jwtTokenService.signFor.mockResolvedValue({
      accessToken: 'jwt',
      expiresIn: 900,
    });
    deviceRepository.findByDeviceId.mockResolvedValue(null);
    deviceRepository.save.mockImplementation(async (d) => d);
    userRepository.save.mockImplementation(async (u: User) => u);
  });

  it('auto-crea user con perfil de Google cuando no existe', async () => {
    userRepository.findByFirebaseUid.mockResolvedValue(null);

    const result = await useCase.execute({
      dto: { google_id_token: 'gid' } as never,
      device,
    });

    expect(userRepository.save).toHaveBeenCalled();
    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.email).toBe('jane@kashy.app');
    expect(savedUser.firstName).toBe('Jane');
    expect(savedUser.lastName).toBe('Doe');
    expect(savedUser.avatarUrl).toBe('https://photo');
    expect(savedUser.countryCode).toBe('VE');
    expect(prefsRepository.save).toHaveBeenCalled();
    expect(result.access_token).toBe('jwt');
  });

  it('reutiliza user existente sin crear prefs', async () => {
    const existing = User.create(
      'u-1',
      'fb-uid',
      'jane@kashy.app',
      'VE',
    );
    userRepository.findByFirebaseUid.mockResolvedValue(existing);

    await useCase.execute({
      dto: { google_id_token: 'gid' } as never,
      device,
    });

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(prefsRepository.save).not.toHaveBeenCalled();
    expect(deviceRepository.save).toHaveBeenCalled();
  });
});
