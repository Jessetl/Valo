import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NotificationNotFoundException } from '../../domain/exceptions/notification-not-found.exception';

interface DeleteNotificationInput {
  userId: string;
  notificationId: string;
}

@Injectable()
export class DeleteNotificationUseCase
  implements UseCase<DeleteNotificationInput, void>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(input: DeleteNotificationInput): Promise<void> {
    const notification = await this.repo.findByIdAndUserId(
      input.notificationId,
      input.userId,
    );
    if (!notification) {
      throw new NotificationNotFoundException(input.notificationId);
    }
    await this.repo.deleteById(notification.id);
  }
}
