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
    if (!record || !record.date) {
      return null;
    }
    return this.toView(record, record.date);
  }

  async findByIds(ids: string[]): Promise<FinancialRecordView[]> {
    if (ids.length === 0) {
      return [];
    }
    const unique = Array.from(new Set(ids));
    const records = await this.repo.findByIds(unique);
    const views: FinancialRecordView[] = [];
    for (const r of records) {
      if (r.date) views.push(this.toView(r, r.date));
    }
    return views;
  }

  private toView(record: FinancialRecord, date: Date): FinancialRecordView {
    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
      type: record.type,
      amountUsd: record.amountUsd,
      date,
    };
  }
}
