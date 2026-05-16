import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import type { UserIdentityResolver } from '../../../../shared-kernel/infrastructure/services/user-identity-resolver.service';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LoginWithGoogleUseCase } from '../../application/use-cases/login-with-google.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { RecoverPasswordUseCase } from '../../application/use-cases/recover-password.use-case';
import { AuthController } from './auth.controller';

type ExecMock = { execute: jest.Mock<(...args: unknown[]) => Promise<any>> };
type ResolverMock = {
  resolve: jest.Mock<(...args: unknown[]) => Promise<string>>;
};

function makeExecMock(): ExecMock {
  return { execute: jest.fn() };
}

function makeResolverMock(): ResolverMock {
  return { resolve: jest.fn() };
}

describe('AuthController', () => {
  let registerUser: ExecMock;
  let loginUser: ExecMock;
  let loginWithGoogle: ExecMock;
  let refreshToken: ExecMock;
  let getUserById: ExecMock;
  let updateProfile: ExecMock;
  let logout: ExecMock;
  let changePassword: ExecMock;
  let recoverPassword: ExecMock;
  let userIdentityResolver: ResolverMock;
  let controller: AuthController;

  const firebaseUser = { uid: 'fb-1', email: 'user@example.com' };
  const device = {
    deviceId: 'dev-1',
    deviceName: 'Pixel',
    fcmToken: null,
    platform: 'android',
    appVersion: null,
  };

  beforeEach(() => {
    registerUser = makeExecMock();
    loginUser = makeExecMock();
    loginWithGoogle = makeExecMock();
    refreshToken = makeExecMock();
    getUserById = makeExecMock();
    updateProfile = makeExecMock();
    logout = makeExecMock();
    changePassword = makeExecMock();
    recoverPassword = makeExecMock();
    userIdentityResolver = makeResolverMock();

    userIdentityResolver.resolve.mockResolvedValue('user-1');

    controller = new AuthController(
      registerUser as unknown as RegisterUserUseCase,
      loginUser as unknown as LoginUserUseCase,
      loginWithGoogle as unknown as LoginWithGoogleUseCase,
      refreshToken as unknown as RefreshTokenUseCase,
      getUserById as unknown as GetUserByIdUseCase,
      updateProfile as unknown as UpdateProfileUseCase,
      logout as unknown as LogoutUseCase,
      changePassword as unknown as ChangePasswordUseCase,
      recoverPassword as unknown as RecoverPasswordUseCase,
      userIdentityResolver as unknown as UserIdentityResolver,
    );
  });

  it('register delega dto al use case', async () => {
    registerUser.execute.mockResolvedValue({
      message: 'ok',
      email: 'a@b.com',
    });
    const dto = { email: 'a@b.com' };

    const result = await controller.register(dto as never);

    expect(registerUser.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'ok', email: 'a@b.com' });
  });

  it('login delega dto + device', async () => {
    loginUser.execute.mockResolvedValue({ access_token: 't' });
    const dto = { email: 'a@b.com', password: 'pw' };

    await controller.login(dto as never, device);

    expect(loginUser.execute).toHaveBeenCalledWith({ dto, device });
  });

  it('loginGoogle delega dto + device', async () => {
    loginWithGoogle.execute.mockResolvedValue({ access_token: 't' });
    const dto = { google_id_token: 'gid' };

    await controller.loginGoogle(dto as never, device);

    expect(loginWithGoogle.execute).toHaveBeenCalledWith({ dto, device });
  });

  it('refresh delega deviceId', async () => {
    refreshToken.execute.mockResolvedValue({ access_token: 't' });

    await controller.refresh('dev-1');

    expect(refreshToken.execute).toHaveBeenCalledWith({ deviceId: 'dev-1' });
  });

  it('recoverPassword delega dto', async () => {
    recoverPassword.execute.mockResolvedValue(undefined);
    const dto = { email: 'a@b.com' };

    await controller.recoverPassword(dto as never);

    expect(recoverPassword.execute).toHaveBeenCalledWith(dto);
  });

  it('changePassword resuelve userId y delega', async () => {
    changePassword.execute.mockResolvedValue(undefined);
    const dto = { current_password: 'a', new_password: 'b' };

    await controller.changePassword(firebaseUser, dto as never, device);

    expect(userIdentityResolver.resolve).toHaveBeenCalledWith(firebaseUser);
    expect(changePassword.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      dto,
      device,
    });
  });

  it('profile devuelve user via getUserById', async () => {
    getUserById.execute.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

    const result = await controller.profile(firebaseUser);

    expect(getUserById.execute).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'user-1', email: 'a@b.com' });
  });

  it('updateProfile delega payload', async () => {
    updateProfile.execute.mockResolvedValue({ id: 'user-1' });
    const dto = { first_name: 'Jane' };

    await controller.updateProfile(firebaseUser, dto as never);

    expect(updateProfile.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      dto,
    });
  });

  it('logout delega userId + deviceId', async () => {
    logout.execute.mockResolvedValue(undefined);

    await controller.logout(firebaseUser, 'dev-1');

    expect(logout.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceId: 'dev-1',
    });
  });

  it('propaga unauthorized del resolver en rutas autenticadas', async () => {
    userIdentityResolver.resolve.mockRejectedValueOnce(
      new UnauthorizedException('Invalid Firebase token payload'),
    );

    await expect(controller.profile(firebaseUser)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(getUserById.execute).not.toHaveBeenCalled();
  });
});
