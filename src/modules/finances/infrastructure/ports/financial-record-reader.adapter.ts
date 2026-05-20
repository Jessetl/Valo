import { Inject, Injectable } from '@nestjs/common';
import type {
  FinancialRecordView,
  IFinancialRecordReader,
} from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FinancialRecord } from '../../domain/entities/financial-record.entity';

@Injectable()
export class FinancialRecordReaderAdapter implements IFinancialRecordReader {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly repo: IFinancialRecordRepository,
  ) {}

  async findById(id: string): Promise<FinancialRecordView | null> {
    const record = await this.repo.findById(id);
    if (!record) return null;
    return this.toView(record);
  }

  async findByIds(ids: string[]): Promise<FinancialRecordView[]> {
    if (ids.length === 0) return [];
    const unique = Array.from(new Set(ids));
    const records = await this.repo.findByIds(unique);
    return records.map((r) => this.toView(r));
  }

  private toView(record: FinancialRecord): FinancialRecordView {
    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
      type: record.type,
      amountLocal: record.amountLocal,
      amountUsd: record.amountUsd,
      date: record.date,
    };
  }
}
