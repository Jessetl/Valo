import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../orm-entities/user.orm-entity';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

interface DeviceTokenRow {
  fcm_token: string | null;
}

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    if (!orm) return null;
    const fcmToken = await this.getLatestFcmToken(orm.id);
    return UserPersistenceMapper.toDomain(orm, fcmToken);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const orm = await this.ormRepository.findOne({ where: { firebaseUid } });
    if (!orm) {
      return null;
    }
    const fcmToken = await this.getLatestFcmToken(orm.id);
    return UserPersistenceMapper.toDomain(orm, fcmToken);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.ormRepository.findOne({ where: { email } });
    if (!orm) {
      return null;
    }
    const fcmToken = await this.getLatestFcmToken(orm.id);
    return UserPersistenceMapper.toDomain(orm, fcmToken);
  }

  async save(user: User): Promise<User> {
    const orm = UserPersistenceMapper.toOrm(user);
    const saved = await this.ormRepository.save(orm);
    return UserPersistenceMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private async getLatestFcmToken(userId: string): Promise<string | null> {
    const rows = await this.ormRepository.manager.query<DeviceTokenRow[]>(
      `
        SELECT firebase_fcm_token AS fcm_token
        FROM user_devices
        WHERE user_id = $1
        ORDER BY last_active_at DESC
        LIMIT 1
      `,
      [userId],
    );

    return rows.length > 0 ? rows[0].fcm_token : null;
  }
}
