import { Inject, Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../domain/interfaces/repositories/notification.repository.interface';
import type {
  FinancialRecordView,
  IFinancialRecordReader,
} from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import { FINANCIAL_RECORD_READER } from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import { SearchNotificationsDto } from '../dtos/search-notifications.dto';
import {
  NotificationListItemDto,
} from '../dtos/notification-list-item.dto';
import {
  SearchNotificationsMetaDto,
  SearchNotificationsResponseDto,
} from '../dtos/search-notifications-response.dto';
import { NotificationMapper } from '../mappers/notification.mapper';

interface SearchNotificationsInput {
  userId: string;
  dto: SearchNotificationsDto;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class SearchNotificationsUseCase
  implements UseCase<SearchNotificationsInput, SearchNotificationsResponseDto>
{
  private readonly logger = new Logger(SearchNotificationsUseCase.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: INotificationRepository,
    @Inject(FINANCIAL_RECORD_READER)
    private readonly financialReader: IFinancialRecordReader,
  ) {}

  async execute(
    input: SearchNotificationsInput,
  ): Promise<SearchNotificationsResponseDto> {
    const page = input.dto.page ?? DEFAULT_PAGE;
    const limit = input.dto.limit ?? DEFAULT_LIMIT;

    const { data: notifications, total } = await this.repo.search({
      userId: input.userId,
      page,
      limit,
      filters: {
        isRead: input.dto.filters?.is_read ?? null,
        status: input.dto.filters?.status ?? null,
        type: input.dto.filters?.type ?? null,
        scheduledDateFrom: input.dto.filters?.scheduled_date_from
          ? new Date(input.dto.filters.scheduled_date_from)
          : null,
        scheduledDateTo: input.dto.filters?.scheduled_date_to
          ? new Date(input.dto.filters.scheduled_date_to)
          : null,
      },
    });

    const financialIds = notifications.map((n) => n.financialId);
    const records = await this.financialReader.findByIds(financialIds);
    const recordsMap = new Map<string, FinancialRecordView>(
      records.map((r) => [r.id, r]),
    );

    const items: NotificationListItemDto[] = [];
    for (const notification of notifications) {
      const record = recordsMap.get(notification.financialId);
      if (!record) {
        this.logger.warn(
          `Notification ${notification.id} references missing financial_record ${notification.financialId}; skipping from listing`,
        );
        continue;
      }
      items.push(NotificationMapper.toListItem(notification, record));
    }

    const meta: SearchNotificationsMetaDto = {
      page,
      limit,
      total,
      total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
    };

    return { data: items, meta };
  }
}
