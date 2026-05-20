import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { NotificationOrmEntity } from './infrastructure/persistence/orm-entities/notification.orm-entity';
import { NotificationPreferencesOrmEntity } from './infrastructure/persistence/orm-entities/notification-preferences.orm-entity';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/repositories/typeorm-notification.repository';
import { TypeOrmNotificationPreferencesRepository } from './infrastructure/persistence/repositories/typeorm-notification-preferences.repository';
import { NOTIFICATION_REPOSITORY } from './domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_PREFERENCES_REPOSITORY } from './domain/interfaces/repositories/notification-preferences.repository.interface';
import { NOTIFICATION_QUEUE_SERVICE } from './domain/interfaces/notification-queue.service.interface';
import { PUSH_NOTIFICATION_SERVICE } from './domain/interfaces/push-notification.service.interface';
import { RabbitMqNotificationQueueService } from './infrastructure/messaging/rabbitmq-notification-queue.service';
import { RabbitMqNotificationConsumer } from './infrastructure/messaging/rabbitmq-notification.consumer';
import { FcmPushNotificationService } from './infrastructure/push/fcm-push-notification.service';
import { NotificationCronService } from './infrastructure/scheduling/notification-cron.service';
import { ScheduleFinancialNotificationUseCase } from './application/use-cases/schedule-financial-notification.use-case';
import { CancelFinancialNotificationsUseCase } from './application/use-cases/cancel-financial-notifications.use-case';
import { ProcessPendingNotificationsUseCase } from './application/use-cases/process-pending-notifications.use-case';
import { SearchNotificationsUseCase } from './application/use-cases/search-notifications.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { GetNotificationPreferencesUseCase } from './application/use-cases/get-notification-preferences.use-case';
import { UpdateNotificationPreferencesUseCase } from './application/use-cases/update-notification-preferences.use-case';
import { FinancialRecordEventsHandler } from './application/event-handlers/financial-record.handler';
import { UserEventsHandler } from './application/event-handlers/user.handler';
import { FinancialNotificationReaderAdapter } from './infrastructure/ports/financial-notification-reader.adapter';
import { NotificationController } from './infrastructure/controllers/notification.controller';
import { NotificationPreferencesController } from './infrastructure/controllers/notification-preferences.controller';
import { rabbitmqConfig } from './infrastructure/messaging/rabbitmq.config';
import { FINANCIAL_NOTIFICATION_READER } from '../../shared-kernel/application/ports/financial-notification-reader.port';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationOrmEntity,
      NotificationPreferencesOrmEntity,
    ]),
    ScheduleModule.forRoot(),
    ConfigModule.forFeature(rabbitmqConfig),
  ],
  controllers: [NotificationController, NotificationPreferencesController],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: TypeOrmNotificationRepository,
    },
    {
      provide: NOTIFICATION_PREFERENCES_REPOSITORY,
      useClass: TypeOrmNotificationPreferencesRepository,
    },
    {
      provide: NOTIFICATION_QUEUE_SERVICE,
      useClass: RabbitMqNotificationQueueService,
    },
    {
      provide: PUSH_NOTIFICATION_SERVICE,
      useClass: FcmPushNotificationService,
    },
    {
      provide: FINANCIAL_NOTIFICATION_READER,
      useClass: FinancialNotificationReaderAdapter,
    },
    ScheduleFinancialNotificationUseCase,
    CancelFinancialNotificationsUseCase,
    ProcessPendingNotificationsUseCase,
    SearchNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    DeleteNotificationUseCase,
    GetNotificationPreferencesUseCase,
    UpdateNotificationPreferencesUseCase,
    RabbitMqNotificationConsumer,
    NotificationCronService,
    FinancialRecordEventsHandler,
    UserEventsHandler,
  ],
  exports: [
    NOTIFICATION_REPOSITORY,
    NOTIFICATION_PREFERENCES_REPOSITORY,
    FINANCIAL_NOTIFICATION_READER,
  ],
})
export class NotificationsModule {}
