import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../../shared-kernel/infrastructure/decorators/current-user-id.decorator';
import { ParseUUIDPipe } from '../../../../shared-kernel/infrastructure/pipes/parse-uuid.pipe';
import { SearchNotificationsUseCase } from '../../application/use-cases/search-notifications.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from '../../application/use-cases/delete-notification.use-case';
import { SearchNotificationsDto } from '../../application/dtos/search-notifications.dto';
import { SearchNotificationsResponseDto } from '../../application/dtos/search-notifications-response.dto';
import { UnreadCountResponseDto } from '../../application/dtos/unread-count-response.dto';
import { MarkAllReadResponseDto } from '../../application/dtos/mark-all-read-response.dto';
import { NotificationListItemDto } from '../../application/dtos/notification-list-item.dto';

@ApiTags('Notifications')
@ApiBearerAuth('jwt')
@ApiHeader({ name: 'X-Device-Id', required: true })
@ApiHeader({ name: 'X-Device-Name', required: true })
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly searchNotifications: SearchNotificationsUseCase,
    private readonly getUnreadCount: GetUnreadCountUseCase,
    private readonly markNotificationRead: MarkNotificationReadUseCase,
    private readonly markAllNotificationsRead: MarkAllNotificationsReadUseCase,
    private readonly deleteNotification: DeleteNotificationUseCase,
  ) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar notificaciones con filtros y paginacion',
    description:
      'Devuelve la pagina solicitada de notificaciones del usuario con su registro financiero asociado para evitar segundas llamadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado',
    type: SearchNotificationsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Filtros invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  search(
    @CurrentUserId() userId: string,
    @Body() dto: SearchNotificationsDto,
  ): Promise<SearchNotificationsResponseDto> {
    return this.searchNotifications.execute({ userId, dto });
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Contador de notificaciones no leidas',
    description: 'Usado por el Dashboard para el badge del icono.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contador',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  unreadCount(
    @CurrentUserId() userId: string,
  ): Promise<UnreadCountResponseDto> {
    return this.getUnreadCount.execute(userId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leidas',
    description:
      'Atomicamente marca como leidas todas las notificaciones no leidas del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conteo de marcadas',
    type: MarkAllReadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  readAll(@CurrentUserId() userId: string): Promise<MarkAllReadResponseDto> {
    return this.markAllNotificationsRead.execute(userId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar notificacion como leida',
    description: 'Marca como leida una notificacion del usuario autenticado.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Notificacion marcada',
    type: NotificationListItemDto,
  })
  @ApiResponse({ status: 400, description: 'ID invalido' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Notificacion no encontrada' })
  markRead(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ): Promise<NotificationListItemDto> {
    return this.markNotificationRead.execute({ userId, notificationId });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar notificacion',
    description:
      'Elimina la notificacion del usuario autenticado. No afecta al registro financiero asociado.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Notificacion eliminada' })
  @ApiResponse({ status: 400, description: 'ID invalido' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Notificacion no encontrada' })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ): Promise<void> {
    await this.deleteNotification.execute({ userId, notificationId });
  }
}
