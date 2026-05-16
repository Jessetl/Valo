import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
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

function makeExecMock(): ExecMock {
  return { execute: jest.fn() };
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
  let controller: AuthController;

  const userId = 'user-1';
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

  it('refresh delega deviceId + accessTokenHint extraido del header', async () => {
    refreshToken.execute.mockResolvedValue({ access_token: 't' });

    await controller.refresh('dev-1', 'Bearer jwt-expirado');

    expect(refreshToken.execute).toHaveBeenCalledWith({
      deviceId: 'dev-1',
      accessTokenHint: 'jwt-expirado',
    });
  });

  it('refresh lanza unauthorized si no hay Authorization Bearer', async () => {
    expect(() => controller.refresh('dev-1', undefined)).toThrow(
      UnauthorizedException,
    );

    expect(refreshToken.execute).not.toHaveBeenCalled();
  });

  it('refresh lanza unauthorized si Authorization tiene formato invalido', async () => {
    expect(() => controller.refresh('dev-1', 'NotBearer xyz')).toThrow(
      UnauthorizedException,
    );
  });

  it('recoverPassword delega dto', async () => {
    recoverPassword.execute.mockResolvedValue(undefined);
    const dto = { email: 'a@b.com' };

    await controller.recoverPassword(dto as never);

    expect(recoverPassword.execute).toHaveBeenCalledWith(dto);
  });

  it('changePassword delega userId + dto + device', async () => {
    changePassword.execute.mockResolvedValue(undefined);
    const dto = { current_password: 'a', new_password: 'b' };

    await controller.changePassword(userId, dto as never, device);

    expect(changePassword.execute).toHaveBeenCalledWith({
      userId,
      dto,
      device,
    });
  });

  it('profile devuelve user via getUserById', async () => {
    getUserById.execute.mockResolvedValue({ id: userId, email: 'a@b.com' });

    const result = await controller.profile(userId);

    expect(getUserById.execute).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ id: userId, email: 'a@b.com' });
  });

  it('updateProfile delega userId + dto', async () => {
    updateProfile.execute.mockResolvedValue({ id: userId });
    const dto = { first_name: 'Jane' };

    await controller.updateProfile(userId, dto as never);

    expect(updateProfile.execute).toHaveBeenCalledWith({ userId, dto });
  });

  it('logout delega userId + deviceId', async () => {
    logout.execute.mockResolvedValue(undefined);

    await controller.logout(userId, 'dev-1');

    expect(logout.execute).toHaveBeenCalledWith({ userId, deviceId: 'dev-1' });
  });
});
