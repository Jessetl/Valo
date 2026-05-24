import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FinancialSummaryResponseDto } from '../dtos/financial-summary-response.dto';
import { FinancialRecordMapper } from '../mappers/financial-record.mapper';
import { monthBounds, startOfTodayUtc } from '../utils/date.util';

const UPCOMING_LIMIT = 3;

interface GetFinancialSummaryInput {
  userId: string;
  month?: number;
  year?: number;
}

@Injectable()
export class GetFinancialSummaryUseCase implements UseCase<
  GetFinancialSummaryInput,
  FinancialSummaryResponseDto
> {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly recordRepository: IFinancialRecordRepository,
  ) {}

  async execute(
    input: GetFinancialSummaryInput,
  ): Promise<FinancialSummaryResponseDto> {
    const now = new Date();
    const year = input.year ?? now.getUTCFullYear();
    const month = input.month ?? now.getUTCMonth() + 1;
    const monthIndex0 = month - 1;

    const { start, end } = monthBounds(year, monthIndex0);
    const totals = await this.recordRepository.monthlyTotals(
      input.userId,
      start,
      end,
    );

    const today = startOfTodayUtc();
    const upcoming = await this.recordRepository.upcomingExpenses(
      input.userId,
      today,
      end,
      UPCOMING_LIMIT,
    );

    return {
      month,
      year,
      totalIncomeLocal: totals.totalIncomeLocal,
      totalIncomeUsd: totals.totalIncomeUsd,
      totalExpenseLocal: totals.totalExpenseLocal,
      totalExpenseUsd: totals.totalExpenseUsd,
      netBalanceLocal: totals.totalIncomeLocal - totals.totalExpenseLocal,
      netBalanceUsd: totals.totalIncomeUsd - totals.totalExpenseUsd,
      upcomingExpenses: upcoming.map((r) =>
        FinancialRecordMapper.toUpcomingExpense(r),
      ),
    };
  }
}
