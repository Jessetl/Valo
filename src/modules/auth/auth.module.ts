import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/orm-entities/user.orm-entity';
import { NotificationPreferencesOrmEntity } from './infrastructure/persistence/orm-entities/notification-preferences.orm-entity';
import { UserDeviceOrmEntity } from './infrastructure/persistence/orm-entities/user-device.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { TypeOrmNotificationPreferencesRepository } from './infrastructure/persistence/repositories/typeorm-notification-preferences.repository';
import { TypeOrmUserDeviceRepository } from './infrastructure/persistence/repositories/typeorm-user-device.repository';
import { FirebaseAuthService } from './infrastructure/services/firebase-auth.service';
import { USER_REPOSITORY } from './domain/interfaces/repositories/user.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from './domain/interfaces/repositories/notification-preferences.repository.interface';
import { USER_DEVICE_REPOSITORY } from './domain/interfaces/repositories/user-device.repository.interface';
import { FIREBASE_AUTH_SERVICE } from './domain/interfaces/services/firebase-auth.service.interface';
import { FIREBASE_USER_SYNC_PORT } from '../../shared-kernel/domain/interfaces/firebase-user-sync.port';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LoginWithGoogleUseCase } from './application/use-cases/login-with-google.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { RecoverPasswordUseCase } from './application/use-cases/recover-password.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { SyncFirebaseUserUseCase } from './application/use-cases/sync-firebase-user.use-case';
import { JwtTokenService } from './application/services/jwt-token.service';
import { UserIdentityResolver } from '../../shared-kernel/infrastructure/services/user-identity-resolver.service';
import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      NotificationPreferencesOrmEntity,
      UserDeviceOrmEntity,
    ]),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET env var is not configured');
        }
        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    {
      provide: NOTIFICATION_PREFERENCES_REPOSITORY,
      useClass: TypeOrmNotificationPreferencesRepository,
    },
    { provide: USER_DEVICE_REPOSITORY, useClass: TypeOrmUserDeviceRepository },
    { provide: FIREBASE_AUTH_SERVICE, useClass: FirebaseAuthService },
    JwtTokenService,
    RegisterUserUseCase,
    LoginUserUseCase,
    LoginWithGoogleUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    RecoverPasswordUseCase,
    GetUserByIdUseCase,
    UpdateProfileUseCase,
    LogoutUseCase,
    SyncFirebaseUserUseCase,
    {
      provide: FIREBASE_USER_SYNC_PORT,
      useExisting: SyncFirebaseUserUseCase,
    },
    UserIdentityResolver,
  ],
  exports: [
    USER_REPOSITORY,
    NOTIFICATION_PREFERENCES_REPOSITORY,
    USER_DEVICE_REPOSITORY,
    FIREBASE_USER_SYNC_PORT,
    SyncFirebaseUserUseCase,
    JwtTokenService,
    UserIdentityResolver,
  ],
})
export class AuthModule {}
