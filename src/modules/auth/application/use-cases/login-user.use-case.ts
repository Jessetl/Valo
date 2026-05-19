import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import { encryptString } from '../../../../shared-kernel/utils/crypto.util';
import { withMinDuration } from '../../../../shared-kernel/utils/constant-time.util';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { FIREBASE_AUTH_SERVICE } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { User } from '../../domain/entities/user.entity';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';
import { UserDevice } from '../../domain/entities/user-device.entity';
import { EmailNotVerifiedException } from '../../domain/exceptions/email-not-verified.exception';
import { LoginUserDto } from '../dtos/login-user.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { JwtTokenService } from '../services/jwt-token.service';
import { DeviceInfo } from '../../infrastructure/decorators/device-info.decorator';

interface LoginUserInput {
  dto: LoginUserDto;
  device: DeviceInfo;
}

const MIN_RESPONSE_TIME_MS = 800;

@Injectable()
export class LoginUserUseCase implements UseCase<
  LoginUserInput,
  AuthResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
    @Inject(FIREBASE_AUTH_SERVICE)
    private readonly firebaseAuth: IFirebaseAuthService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  execute(input: LoginUserInput): Promise<AuthResponseDto> {
    return withMinDuration(() => this.run(input), MIN_RESPONSE_TIME_MS);
  }

  private async run(input: LoginUserInput): Promise<AuthResponseDto> {
    const { dto, device } = input;

    const firebaseResult = await this.firebaseAuth.signIn({
      email: dto.email,
      password: dto.password,
    });

    const emailVerified = await this.firebaseAuth.isEmailVerified(
      firebaseResult.firebaseUid,
    );
    if (!emailVerified) {
      throw new EmailNotVerifiedException();
    }

    const user = await this.findOrCreateUser(
      firebaseResult.firebaseUid,
      firebaseResult.email,
    );

    await this.upsertDevice(user.id, device, firebaseResult.refreshToken);

    const signed = await this.jwtTokenService.signFor(user);

    return {
      access_token: signed.accessToken,
      expires_in: signed.expiresIn,
      user: UserMapper.toResponse(user),
    };
  }

  private async findOrCreateUser(
    firebaseUid: string,
    email: string,
  ): Promise<User> {
    const existing = await this.userRepository.findByFirebaseUid(firebaseUid);
    if (existing) return existing;

    const user = User.create(randomUUID(), firebaseUid, email, 'VE');
    const saved = await this.userRepository.save(user);

    const prefs = NotificationPreferences.createDefault(randomUUID(), saved.id);
    await this.prefsRepository.save(prefs);

    return saved;
  }

  private async upsertDevice(
    userId: string,
    device: DeviceInfo,
    rawRefreshToken: string,
  ): Promise<void> {
    const encrypted = encryptString(rawRefreshToken);
    const existing = await this.deviceRepository.findByDeviceId(
      device.deviceId,
    );

    if (existing && existing.userId === userId) {
      const reassigned = existing.reassignToUser(
        userId,
        device.deviceName,
        encrypted,
        device.platform,
        device.fcmToken,
        device.appVersion,
      );
      await this.deviceRepository.save(reassigned);
      return;
    }

    if (existing) {
      await this.deviceRepository.delete(existing.id);
    }

    const newDevice = UserDevice.create(
      randomUUID(),
      userId,
      device.deviceId,
      device.deviceName,
      encrypted,
      device.platform,
      device.fcmToken,
      device.appVersion,
    );
    await this.deviceRepository.save(newDevice);
  }
}
