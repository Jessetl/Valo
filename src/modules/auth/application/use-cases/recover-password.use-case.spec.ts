import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { RecoverPasswordUseCase } from './recover-password.use-case';

describe('RecoverPasswordUseCase', () => {
  let firebaseAuth: jest.Mocked<IFirebaseAuthService>;
  let useCase: RecoverPasswordUseCase;

  beforeEach(() => {
    firebaseAuth = { sendPasswordResetEmail: jest.fn() } as never;
    useCase = new RecoverPasswordUseCase(firebaseAuth);
  });

  it('delega email al servicio Firebase', async () => {
    firebaseAuth.sendPasswordResetEmail.mockResolvedValue(undefined);

    await useCase.execute({ email: 'jane@kashy.app' } as never);

    expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
      'jane@kashy.app',
    );
  });

  it('propaga errores no swallowed por el servicio', async () => {
    firebaseAuth.sendPasswordResetEmail.mockRejectedValue(
      new Error('TOO_MANY_ATTEMPTS'),
    );

    await expect(
      useCase.execute({ email: 'jane@kashy.app' } as never),
    ).rejects.toThrow('TOO_MANY_ATTEMPTS');
  });
});
