import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';

interface CancelFinancialNotificationsInput {
  financialId: string;
}

@Injectable()
export class CancelFinancialNotificationsUseCase implements UseCase<
  CancelFinancialNotificationsInput,
  void
> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(input: CancelFinancialNotificationsInput): Promise<void> {
    await this.notificationRepository.deleteByFinancialId(input.financialId);
  }
}
