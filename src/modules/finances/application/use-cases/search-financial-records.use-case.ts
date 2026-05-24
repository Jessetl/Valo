import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import type { IFinancialNotificationReader } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { FINANCIAL_NOTIFICATION_READER } from '../../../../shared-kernel/application/ports/financial-notification-reader.port';
import { SearchFinancialRecordsDto } from '../dtos/search-financial-records.dto';
import { SearchFinancialRecordsResponseDto } from '../dtos/search-financial-records-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
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
    @Inject(FINANCIAL_NOTIFICATION_READER)
    private readonly notificationReader: IFinancialNotificationReader,
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
          filters.isRecurring === undefined || filters.isRecurring === null
            ? null
            : filters.isRecurring,
        dateFrom: filters.dateFrom ? parseDateOnly(filters.dateFrom) : null,
        dateTo: filters.dateTo ? parseDateOnly(filters.dateTo) : null,
      },
    });

    const notificationsByFinancial =
      await this.notificationReader.findActiveByFinancialIds(
        data.map((record) => record.id),
      );

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
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }
}
