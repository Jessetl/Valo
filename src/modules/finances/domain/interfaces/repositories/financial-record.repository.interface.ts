import { FinancialRecord } from '../../entities/financial-record.entity';
import { FinancialPriority } from '../../enums/financial-priority.enum';
import { FinancialType } from '../../enums/financial-type.enum';

export const FINANCIAL_RECORD_REPOSITORY = Symbol(
  'FINANCIAL_RECORD_REPOSITORY',
);

export interface SearchFinancialRecordsFilters {
  type?: FinancialType | null;
  priority?: FinancialPriority | null;
  isRecurring?: boolean | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

export interface SearchFinancialRecordsParams {
  userId: string;
  page: number;
  limit: number;
  filters?: SearchFinancialRecordsFilters;
}

export interface PaginatedFinancialRecords {
  data: FinancialRecord[];
  total: number;
}

export interface MonthlyTotals {
  totalIncomeLocal: number;
  totalIncomeUsd: number;
  totalExpenseLocal: number;
  totalExpenseUsd: number;
}

export interface IFinancialRecordRepository {
  findById(id: string): Promise<FinancialRecord | null>;
  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<FinancialRecord | null>;
  search(
    params: SearchFinancialRecordsParams,
  ): Promise<PaginatedFinancialRecords>;
  save(record: FinancialRecord): Promise<FinancialRecord>;
  delete(id: string): Promise<void>;
  monthlyTotals(
    userId: string,
    monthStart: Date,
    monthEnd: Date,
  ): Promise<MonthlyTotals>;
  upcomingExpenses(
    userId: string,
    fromDate: Date,
    toDate: Date,
    limit: number,
  ): Promise<FinancialRecord[]>;
  findActiveRecurring(): Promise<FinancialRecord[]>;
  existsForMonth(params: {
    userId: string;
    title: string;
    type: FinancialType;
    monthStart: Date;
    monthEnd: Date;
  }): Promise<boolean>;
}
