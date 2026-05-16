import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  FIREBASE_USER_SYNC_PORT,
  type IFirebaseUserSyncPort,
} from '../../domain/interfaces/firebase-user-sync.port';
import type { FirebaseUser } from '../guards/firebase-auth.guard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class UserIdentityResolver {
  constructor(
    @Inject(FIREBASE_USER_SYNC_PORT)
    private readonly syncFirebaseUser: IFirebaseUserSyncPort,
  ) {}

  async resolve(firebaseUser: FirebaseUser | undefined): Promise<string> {
    const email = firebaseUser?.email?.trim();
    const hasValidEmail = typeof email === 'string' && EMAIL_REGEX.test(email);

    if (!firebaseUser?.uid || !hasValidEmail) {
      throw new UnauthorizedException('Invalid Firebase token payload');
    }

    const synced = await this.syncFirebaseUser.execute({
      firebaseUid: firebaseUser.uid,
      email,
    });
    return synced.id;
  }
}
