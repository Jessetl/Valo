import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import { encryptString } from '../../../../shared-kernel/utils/crypto.util';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { FIREBASE_AUTH_SERVICE } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { UserDevice } from '../../domain/entities/user-device.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { DeviceInfo } from '../../infrastructure/decorators/device-info.decorator';

interface ChangePasswordInput {
  userId: string;
  dto: ChangePasswordDto;
  device: DeviceInfo;
}

@Injectable()
export class ChangePasswordUseCase implements UseCase<
  ChangePasswordInput,
  void
> {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
    @Inject(FIREBASE_AUTH_SERVICE)
    private readonly firebaseAuth: IFirebaseAuthService,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const { userId, dto, device } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    await this.firebaseAuth.signIn({
      email: user.email,
      password: dto.current_password,
    });

    await this.firebaseAuth.updatePassword(user.firebaseUid, dto.new_password);

    await this.firebaseAuth.revokeRefreshTokens(user.firebaseUid);

    await this.deviceRepository.deleteByUserIdExceptDevice(
      userId,
      device.deviceId,
    );

    const reSignIn = await this.firebaseAuth.signIn({
      email: user.email,
      password: dto.new_password,
    });

    const encrypted = encryptString(reSignIn.refreshToken);
    const existing = await this.deviceRepository.findByDeviceId(
      device.deviceId,
    );

    if (existing) {
      const rotated = existing.reassignToUser(
        userId,
        device.deviceName,
        encrypted,
        device.platform,
        device.fcmToken,
        device.appVersion,
      );
      await this.deviceRepository.save(rotated);
      return;
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
