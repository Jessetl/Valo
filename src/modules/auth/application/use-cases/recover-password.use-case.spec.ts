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

  it('NO propaga errores de Firebase para evitar leak por status code', async () => {
    firebaseAuth.sendPasswordResetEmail.mockRejectedValue(
      new Error('TOO_MANY_ATTEMPTS'),
    );

    await expect(
      useCase.execute({ email: 'jane@kashy.app' } as never),
    ).resolves.toBeUndefined();
  });

  it('respeta tiempo minimo de respuesta para mitigar timing leak', async () => {
    firebaseAuth.sendPasswordResetEmail.mockResolvedValue(undefined);

    const start = Date.now();
    await useCase.execute({ email: 'jane@kashy.app' } as never);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(595);
  });

  it('aplica tiempo minimo tambien cuando Firebase falla', async () => {
    firebaseAuth.sendPasswordResetEmail.mockRejectedValue(
      new Error('NETWORK_ERROR'),
    );

    const start = Date.now();
    await useCase.execute({ email: 'jane@kashy.app' } as never);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(595);
  });
});
