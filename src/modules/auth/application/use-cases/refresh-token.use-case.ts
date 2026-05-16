import { Inject, Injectable, Logger } from '@nestjs/common';
import { UnauthorizedException } from '../../../../shared-kernel/domain/exceptions/unauthorized.exception';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import {
  decryptString,
  encryptString,
} from '../../../../shared-kernel/utils/crypto.util';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import type { IUserDeviceRepository } from '../../domain/interfaces/repositories/user-device.repository.interface';
import { USER_DEVICE_REPOSITORY } from '../../domain/interfaces/repositories/user-device.repository.interface';
import type { IFirebaseAuthService } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { FIREBASE_AUTH_SERVICE } from '../../domain/interfaces/services/firebase-auth.service.interface';
import { RefreshResponseDto } from '../dtos/refresh-response.dto';
import { JwtTokenService } from '../services/jwt-token.service';

interface RefreshTokenInput {
  deviceId: string;
}

@Injectable()
export class RefreshTokenUseCase implements UseCase<
  RefreshTokenInput,
  RefreshResponseDto
> {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_DEVICE_REPOSITORY)
    private readonly deviceRepository: IUserDeviceRepository,
    @Inject(FIREBASE_AUTH_SERVICE)
    private readonly firebaseAuth: IFirebaseAuthService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshResponseDto> {
    const device = await this.deviceRepository.findByDeviceId(input.deviceId);
    if (!device) {
      throw new UnauthorizedException('Sesion de dispositivo no encontrada');
    }

    let firebaseRefreshToken: string;
    try {
      firebaseRefreshToken = decryptString(device.refreshTokenEncrypted);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Refresh token decryption failed: ${message}`);
      throw new UnauthorizedException('Sesion de dispositivo invalida');
    }

    const result = await this.firebaseAuth.refreshIdToken(firebaseRefreshToken);

    if (result.refreshToken && result.refreshToken !== firebaseRefreshToken) {
      const rotated = device.rotateRefreshToken(
        encryptString(result.refreshToken),
      );
      await this.deviceRepository.save(rotated);
    }

    const user = await this.userRepository.findById(device.userId);
    if (!user) {
      throw new UnauthorizedException('El usuario ya no existe');
    }

    const signed = await this.jwtTokenService.signFor(user);

    return {
      access_token: signed.accessToken,
      expires_in: signed.expiresIn,
    };
  }
}
