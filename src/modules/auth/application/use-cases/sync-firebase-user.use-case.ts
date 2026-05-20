import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import {
  IFirebaseUserSyncPort,
  SyncFirebaseUserInput,
  SyncedUserIdentity,
} from '../../../../shared-kernel/domain/interfaces/firebase-user-sync.port';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import {
  USER_REGISTERED,
  UserRegisteredEvent,
} from '../../../../shared-kernel/domain/events/user.events';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class SyncFirebaseUserUseCase
  implements
    UseCase<SyncFirebaseUserInput, SyncedUserIdentity>,
    IFirebaseUserSyncPort
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
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

    await this.eventEmitter.emitAsync(
      USER_REGISTERED,
      new UserRegisteredEvent(saved.id),
    );

    return { id: saved.id };
  }
}
