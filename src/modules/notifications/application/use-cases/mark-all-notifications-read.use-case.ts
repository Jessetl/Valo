import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import { MarkAllReadResponseDto } from '../dtos/mark-all-read-response.dto';

@Injectable()
export class MarkAllNotificationsReadUseCase
  implements UseCase<string, MarkAllReadResponseDto>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<MarkAllReadResponseDto> {
    const marked = await this.repo.markAllAsReadByUserId(userId);
    return { marked_count: marked };
  }
}
