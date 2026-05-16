import { NotFoundException } from '../../../../shared-kernel/domain/exceptions/not-found.exception';

export class DeviceNotFoundException extends NotFoundException {
  constructor(deviceId: string) {
    super('Dispositivo', deviceId);
  }
}
