import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { DeviceNotFoundException } from '../../domain/exceptions/device-not-found.exception';

interface LogoutInput {
  userId: string;
  deviceId: string;
}

@Injectable()
export class LogoutUseCase implements UseCase<LogoutInput, void> {
  constructor(
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    const device = await this.deviceRepository.findByUserIdAndDeviceId(
      input.userId,
      input.deviceId,
    );
    if (!device) {
      throw new DeviceNotFoundException(input.deviceId);
    }

    await this.deviceRepository.delete(device.id);
  }
}
