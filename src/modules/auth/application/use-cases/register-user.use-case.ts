import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import type { INotificationPreferencesRepository } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from '../../domain/interfaces/repositories/notification-preferences.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { FIREBASE_AUTH_SERVICE } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { User } from '../../domain/entities/user.entity';
import { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { RegisterResponseDto } from '../dtos/register-response.dto';

const SUCCESS_MESSAGE =
  'Usuario registrado. Revisa tu correo para verificar la cuenta antes de iniciar sesion.';

@Injectable()
export class RegisterUserUseCase implements UseCase<
  RegisterUserDto,
  RegisterResponseDto
> {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_PREFERENCES_REPOSITORY)
    private readonly prefsRepository: INotificationPreferencesRepository,
    @Inject(FIREBASE_AUTH_SERVICE)
    private readonly firebaseAuth: IFirebaseAuthService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new UserAlreadyExistsException(dto.email);
    }

    const displayName =
      [dto.first_name, dto.last_name].filter(Boolean).join(' ').trim() ||
      undefined;

    const firebaseResult = await this.firebaseAuth.signUp({
      email: dto.email,
      password: dto.password,
      displayName,
    });

    try {
      const user = User.create(
        randomUUID(),
        firebaseResult.firebaseUid,
        dto.email,
        dto.country_code,
        dto.first_name,
        dto.last_name,
        null,
        dto.latitude ?? null,
        dto.longitude ?? null,
      );

      const savedUser = await this.userRepository.save(user);

      const prefs = NotificationPreferences.createDefault(
        randomUUID(),
        savedUser.id,
      );
      await this.prefsRepository.save(prefs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `DB persistence failed after Firebase signup. Rolling back Firebase user. Reason: ${message}`,
      );
      try {
        await this.firebaseAuth.deleteUser(firebaseResult.firebaseUid);
      } catch (rollbackErr) {
        const rollbackMsg =
          rollbackErr instanceof Error
            ? rollbackErr.message
            : String(rollbackErr);
        this.logger.error(`Firebase rollback failed: ${rollbackMsg}`);
      }
      throw error;
    }

    try {
      await this.firebaseAuth.sendEmailVerification(firebaseResult.idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to send verification email to ${dto.email}: ${message}`,
      );
    }

    return {
      message: SUCCESS_MESSAGE,
      email: dto.email,
    };
  }
}
