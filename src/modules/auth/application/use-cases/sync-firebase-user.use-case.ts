import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import {
  IFirebaseUserSyncPort,
  SyncFirebaseUserInput,
  SyncedUserIdentity,
} from '../../../../shared-kernel/domain/interfaces/firebase-user-sync.port';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';

@Injectable()
export class SyncFirebaseUserUseCase
  implements
    UseCase<SyncFirebaseUserInput, SyncedUserIdentity>,
    IFirebaseUserSyncPort
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
  ) {}

  async execute(input: SyncFirebaseUserInput): Promise<SyncedUserIdentity> {
    const existing = await this.userRepository.findByFirebaseUid(
      input.firebaseUid,
    );
    if (existing) {
      return { id: existing.id };
    }

    const user = User.create(
      randomUUID(),
      input.firebaseUid,
      input.email,
      'VE',
      input.firstName ?? null,
      input.lastName ?? null,
      input.avatarUrl ?? null,
      input.locationLatitude ?? null,
      input.locationLongitude ?? null,
    );

    const saved = await this.userRepository.save(user);

    const prefs = NotificationPreferences.createDefault(randomUUID(), saved.id);
    await this.prefsRepository.save(prefs);

    return { id: saved.id };
  }
}
