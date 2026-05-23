import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { USER_REGISTERED } from '../../../../shared-kernel/domain/events/user.events';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let useCase: RegisterUserUseCase;

  const dto: RegisterUserDto = {
    email: 'jane@kashy.app',
    password: 'StrongPass123',
    firstName: 'Jane',
    lastName: 'Doe',
    countryCode: 'VE',
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByFirebaseUid: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;

    firebaseAuth = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      refreshIdToken: jest.fn(),
      sendEmailVerification: jest.fn(),
      isEmailVerified: jest.fn(),
      deleteUser: jest.fn(),
      updatePassword: jest.fn(),
      revokeRefreshTokens: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      signInWithGoogle: jest.fn(),
    } as never;

    eventEmitter = {
      emitAsync: jest.fn().mockResolvedValue([] as never),
    } as never;

    useCase = new RegisterUserUseCase(
      userRepository,
      firebaseAuth,
      eventEmitter,
    );

    firebaseAuth.signUp.mockResolvedValue({
      firebaseUid: 'fb-uid',
      idToken: 'id-tok',
      refreshToken: 'rt',
      expiresIn: 3600,
      email: dto.email,
    });
    userRepository.save.mockImplementation(async (u: User) => u);
  });

  it('lanza UserAlreadyExistsException si email ya existe', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'u-1',
    } as never);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      UserAlreadyExistsException,
    );
    expect(firebaseAuth.signUp).not.toHaveBeenCalled();
  });

  it('crea user, emite USER_REGISTERED y envia verificacion', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(firebaseAuth.signUp).toHaveBeenCalledWith({
      email: dto.email,
      password: dto.password,
      displayName: 'Jane Doe',
    });
    expect(userRepository.save).toHaveBeenCalled();
    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      USER_REGISTERED,
      expect.objectContaining({ userId: expect.any(String) }),
    );
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith('id-tok');
    expect(result.email).toBe(dto.email);
  });

  it('rollback Firebase si persistencia falla', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute(dto)).rejects.toThrow('db down');
    expect(firebaseAuth.deleteUser).toHaveBeenCalledWith('fb-uid');
  });

  it('no falla si sendEmailVerification falla', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    firebaseAuth.sendEmailVerification.mockRejectedValueOnce(
      new Error('smtp down'),
    );

    await expect(useCase.execute(dto)).resolves.toBeDefined();
  });
});
