import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../../shared-kernel/infrastructure/decorators/current-user-id.decorator';
import { GetNotificationPreferencesUseCase } from '../../application/use-cases/get-notification-preferences.use-case';
import { UpdateNotificationPreferencesUseCase } from '../../application/use-cases/update-notification-preferences.use-case';
import { NotificationPreferencesResponseDto } from '../../application/dtos/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from '../../application/dtos/update-notification-preferences.dto';

@ApiTags('Notifications')
@ApiBearerAuth('jwt')
@ApiHeader({ name: 'X-Device-Id', required: true })
@ApiHeader({ name: 'X-Device-Name', required: true })
@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(
    private readonly getPreferences: GetNotificationPreferencesUseCase,
    private readonly updatePreferences: UpdateNotificationPreferencesUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener preferencias de notificacion',
    description:
      'Devuelve las preferencias del usuario. Si no existen, devuelve los defaults sin persistir.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencias',
    type: NotificationPreferencesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  get(
    @CurrentUserId() userId: string,
  ): Promise<NotificationPreferencesResponseDto> {
    return this.getPreferences.execute(userId);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar preferencias de notificacion',
    description:
      'Actualizacion parcial. Si el usuario no tenia registro de preferencias, se crea automaticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencias actualizadas',
    type: NotificationPreferencesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 422, description: 'Validacion fallida' })
  update(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    return this.updatePreferences.execute({ userId, dto });
  }
}
