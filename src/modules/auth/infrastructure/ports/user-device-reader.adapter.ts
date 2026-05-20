import { Inject, Injectable } from '@nestjs/common';
import type { IUserDeviceReader } from '../../../../shared-kernel/application/ports/user-device-reader.port';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../domain/interfaces/repositories/user-device.repository.interface';

@Injectable()
export class UserDeviceReaderAdapter implements IUserDeviceReader {
  constructor(
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
  ) {}

  async findFcmTokensByUserId(userId: string): Promise<string[]> {
    const devices = await this.deviceRepository.findByUserId(userId);
    return devices
      .map((d) => d.fcmToken)
      .filter((t): t is string => typeof t === 'string' && t.length > 0);
  }
}
