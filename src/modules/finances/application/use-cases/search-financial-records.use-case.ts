import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { INotificationRepository } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { NOTIFICATION_REPOSITORY } from '../../../notifications/domain/interfaces/repositories/notification.repository.interface';
import { Notification } from '../../../notifications/domain/entities/notification.entity';
import { SearchFinancialRecordsDto } from '../dtos/search-financial-records.dto';
import { SearchFinancialRecordsResponseDto } from '../dtos/search-financial-records-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
import { NotificationStatus } from '../../../notifications/domain/enums/notification-status.enum';
import { parseDateOnly } from '../utils/date.util';

interface SearchFinancialRecordsInput {
  userId: string;
  dto: SearchFinancialRecordsDto;
}

@Injectable()
export class SearchFinancialRecordsUseCase implements UseCase<
  SearchFinancialRecordsInput,
  SearchFinancialRecordsResponseDto
> {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    input: SearchFinancialRecordsInput,
  ): Promise<SearchFinancialRecordsResponseDto> {
    const page = input.dto.page ?? 1;
    const limit = input.dto.limit ?? 20;
    const filters = input.dto.filters ?? {};

    const { data, total } = await this.recordRepository.search({
      userId: input.userId,
      page,
      limit,
      filters: {
        type: filters.type ?? null,
        priority: filters.priority ?? null,
        isRecurring:
          filters.is_recurring === undefined || filters.is_recurring === null
            ? null
            : filters.is_recurring,
        dateFrom: filters.date_from ? parseDateOnly(filters.date_from) : null,
        dateTo: filters.date_to ? parseDateOnly(filters.date_to) : null,
      },
    });

    const notificationsByFinancial = new Map<string, Notification>();

    for (const record of data) {
      const list = await this.notificationRepository.findByFinancialId(
        record.id,
      );
      const chosen =
        list.find((n) => n.status === NotificationStatus.PENDING) ??
        list[0] ??
        null;
      if (chosen) {
        notificationsByFinancial.set(record.id, chosen);
      }
    }

    const items = data.map((record) =>
      FinancialRecordMapper.toSummaryItem(
        record,
        notificationsByFinancial.get(record.id) ?? null,
      ),
    );

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }
}
