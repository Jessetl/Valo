import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import { UnreadCountResponseDto } from '../dtos/unread-count-response.dto';

@Injectable()
export class GetUnreadCountUseCase
  implements UseCase<string, UnreadCountResponseDto>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<UnreadCountResponseDto> {
    const count = await this.repo.countUnreadByUserId(userId);
    return { unread_count: count };
  }
}
