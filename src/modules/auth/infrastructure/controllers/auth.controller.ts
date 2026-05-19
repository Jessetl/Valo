import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../../shared-kernel/infrastructure/decorators/public.decorator';
import { CurrentUserId } from '../../../../shared-kernel/infrastructure/decorators/current-user-id.decorator';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LoginWithGoogleUseCase } from '../../application/use-cases/login-with-google.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { RecoverPasswordUseCase } from '../../application/use-cases/recover-password.use-case';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { LoginGoogleDto } from '../../application/dtos/login-google.dto';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
import { RecoverPasswordDto } from '../../application/dtos/recover-password.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { RefreshResponseDto } from '../../application/dtos/refresh-response.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import {
  DeviceIdHeader,
  DeviceInfo,
  DeviceInfoHeaders,
} from '../decorators/device-info.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly loginWithGoogle: LoginWithGoogleUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly recoverPasswordUseCase: RecoverPasswordUseCase,
  ) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea cuenta en Firebase Auth, fila en users y preferencias por defecto. Envia correo de verificacion via Firebase. No emite JWT — el usuario debe verificar su email e iniciar sesion.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado, correo de verificacion enviado',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos o email en uso' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  register(@Body() dto: RegisterUserDto): Promise<RegisterResponseDto> {
    return this.registerUser.execute(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login con email + password',
    description:
      'Autentica contra Firebase, upserta refresh token encriptado en user_devices y devuelve JWT custom (15 min) + perfil.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiHeader({ name: 'X-Fcm-Token', required: false })
  @ApiHeader({ name: 'X-Platform', required: false })
  @ApiHeader({ name: 'X-App-Version', required: false })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(
    @Body() dto: LoginUserDto,
    @DeviceInfoHeaders() device: DeviceInfo,
  ): Promise<AuthResponseDto> {
    return this.loginUser.execute({ dto, device });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login con idToken de Google via Firebase',
    description:
      'Verifica el idToken de Google contra Firebase (signInWithIdp), crea el usuario si no existe (auto-registro), guarda refresh token encriptado en user_devices y devuelve JWT custom + perfil.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiHeader({ name: 'X-Fcm-Token', required: false })
  @ApiHeader({ name: 'X-Platform', required: false })
  @ApiHeader({ name: 'X-App-Version', required: false })
  @ApiResponse({
    status: 200,
    description: 'Login con Google exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'google_id_token invalido' })
  @ApiResponse({ status: 401, description: 'Token de Google rechazado' })
  loginGoogle(
    @Body() dto: LoginGoogleDto,
    @DeviceInfoHeaders() device: DeviceInfo,
  ): Promise<AuthResponseDto> {
    return this.loginWithGoogle.execute({ dto, device });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Renovar JWT custom',
    description:
      'Requiere el JWT custom expirado en Authorization Bearer como proof-of-possession + X-Device-Id. Backend valida firma del JWT (ignorando expiracion), verifica que el device pertenece al user, intercambia el refresh token de Firebase y firma un nuevo JWT.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: false })
  @ApiResponse({
    status: 200,
    description: 'JWT renovado',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Refresh token invalido, revocado, sin Authorization Bearer o device no autorizado',
  })
  refresh(
    @DeviceIdHeader() deviceId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-device-name') _deviceName?: string,
  ): Promise<RefreshResponseDto> {
    void _deviceName;
    const accessTokenHint = extractBearerToken(authorization);
    if (!accessTokenHint) {
      throw new UnauthorizedException(
        'Falta el JWT en Authorization Bearer para refresh',
      );
    }
    return this.refreshToken.execute({ deviceId, accessTokenHint });
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('recover-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Envio de email de recuperacion de contraseña',
    description:
      'Envia un correo de Firebase con el enlace para restablecer la contraseña. Responde 204 incluso si el email no existe, para evitar enumeracion de usuarios.',
  })
  @ApiResponse({ status: 204, description: 'Email de recuperacion enviado' })
  @ApiResponse({ status: 400, description: 'Email invalido' })
  @ApiResponse({ status: 422, description: 'Email mal formado' })
  recoverPassword(@Body() dto: RecoverPasswordDto): Promise<void> {
    return this.recoverPasswordUseCase.execute(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Cambio de contraseña del usuario autenticado',
    description:
      'Verifica la contraseña actual contra Firebase, actualiza la nueva, revoca todos los refresh tokens del usuario y elimina los user_devices distintos al actual. Genera un nuevo refresh token para el dispositivo actual.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiResponse({ status: 204, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'Contraseña actual invalida' })
  @ApiResponse({ status: 422, description: 'Contraseña nueva invalida' })
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() dto: ChangePasswordDto,
    @DeviceInfoHeaders() device: DeviceInfo,
  ): Promise<void> {
    await this.changePasswordUseCase.execute({ userId, dto, device });
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve los datos canonicos del usuario en la BD (no Firebase). El JWT del Bearer identifica al usuario.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiResponse({ status: 200, description: 'Perfil', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async profile(@CurrentUserId() userId: string): Promise<UserResponseDto> {
    return this.getUserById.execute(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Actualizar datos del perfil',
    description:
      'Actualizacion parcial de campos del perfil. El email no es modificable por esta ruta (vinculado a Firebase Auth). Devuelve el DTO canonico actualizado.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 422, description: 'Validacion fallida' })
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.updateProfileUseCase.execute({ userId, dto });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Cerrar sesion del dispositivo actual',
    description:
      'Elimina la fila de user_devices asociada al user_id + X-Device-Id (refresh token + FCM token). Otros dispositivos del usuario permanecen activos.',
  })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  @ApiHeader({ name: 'X-Device-Name', required: true })
  @ApiResponse({ status: 204, description: 'Sesion cerrada' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({
    status: 404,
    description: 'Dispositivo no registrado para el usuario',
  })
  async logout(
    @CurrentUserId() userId: string,
    @DeviceIdHeader() deviceId: string,
  ): Promise<void> {
    await this.logoutUseCase.execute({ userId, deviceId });
  }
}

function extractBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  return match?.[1]?.trim() || undefined;
}
