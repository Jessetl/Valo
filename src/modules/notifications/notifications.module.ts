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
import { FinancialRecordEventsHandler } from './application/event-handlers/financial-record.handler';
import { UserEventsHandler } from './application/event-handlers/user.handler';
import { FinancialNotificationReaderAdapter } from './infrastructure/ports/financial-notification-reader.adapter';
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
