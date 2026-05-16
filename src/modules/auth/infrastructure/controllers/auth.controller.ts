import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../../shared-kernel/infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/decorators/current-user.decorator';
import type { FirebaseUser } from '../../../../shared-kernel/infrastructure/guards/firebase-auth.guard';
import { UserIdentityResolver } from '../../../../shared-kernel/infrastructure/services/user-identity-resolver.service';
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
    private readonly userIdentityResolver: UserIdentityResolver,
  ) {}

  @Public()
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
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar JWT custom',
    description:
      'Usa el firebase_refresh_token encriptado del dispositivo (lookup por X-Device-Id) para obtener un nuevo idToken de Firebase y firma un nuevo JWT custom.',
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
    description: 'Refresh token invalido o revocado',
  })
  refresh(
    @DeviceIdHeader() deviceId: string,
    @Headers('x-device-name') _deviceName?: string,
  ): Promise<RefreshResponseDto> {
    void _deviceName;
    return this.refreshToken.execute({ deviceId });
  }

  @Public()
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

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('firebase-token')
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
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: ChangePasswordDto,
    @DeviceInfoHeaders() device: DeviceInfo,
  ): Promise<void> {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    await this.changePasswordUseCase.execute({ userId, dto, device });
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('firebase-token')
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
  async profile(
    @CurrentUser() firebaseUser: FirebaseUser,
  ): Promise<UserResponseDto> {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.getUserById.execute(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('firebase-token')
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
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.updateProfileUseCase.execute({ userId, dto });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('firebase-token')
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
    @CurrentUser() firebaseUser: FirebaseUser,
    @DeviceIdHeader() deviceId: string,
  ): Promise<void> {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    await this.logoutUseCase.execute({ userId, deviceId });
  }
}
