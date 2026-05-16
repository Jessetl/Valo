import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import type { IUserDeviceRepository } from '../../../domain/interfaces/repositories/user-device.repository.interface';
import { UserDevice } from '../../../domain/entities/user-device.entity';
import { UserDeviceOrmEntity } from '../orm-entities/user-device.orm-entity';
import { UserDevicePersistenceMapper } from '../mappers/user-device-persistence.mapper';

@Injectable()
export class TypeOrmUserDeviceRepository implements IUserDeviceRepository {
  constructor(
    @InjectRepository(UserDeviceOrmEntity)
    private readonly ormRepository: Repository<UserDeviceOrmEntity>,
  ) {}

  async findByDeviceId(deviceId: string): Promise<UserDevice | null> {
    const orm = await this.ormRepository.findOne({ where: { deviceId } });
    return orm ? UserDevicePersistenceMapper.toDomain(orm) : null;
  }

  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<UserDevice | null> {
    const orm = await this.ormRepository.findOne({
      where: { userId, deviceId },
    });
    return orm ? UserDevicePersistenceMapper.toDomain(orm) : null;
  }

  async save(device: UserDevice): Promise<UserDevice> {
    const orm = UserDevicePersistenceMapper.toOrm(device);
    const saved = await this.ormRepository.save(orm);
    return UserDevicePersistenceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async deleteByUserIdExceptDevice(
    userId: string,
    keepDeviceId: string,
  ): Promise<void> {
    await this.ormRepository.delete({
      userId,
      deviceId: Not(keepDeviceId),
    });
  }
}
