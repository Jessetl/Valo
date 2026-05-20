import { Inject, Injectable } from '@nestjs/common';
import type {
  FinancialRecordView,
  IFinancialRecordReader,
} from '../../../../shared-kernel/application/ports/financial-record-reader.port';
import type { IFinancialRecordRepository } from '../../domain/interfaces/repositories/financial-record.repository.interface';
import { FINANCIAL_RECORD_REPOSITORY } from '../../domain/interfaces/repositories/financial-record.repository.interface';

@Injectable()
export class FinancialRecordReaderAdapter implements IFinancialRecordReader {
  constructor(
    @Inject(FINANCIAL_RECORD_REPOSITORY)
    private readonly repo: IFinancialRecordRepository,
  ) {}

  async findById(id: string): Promise<FinancialRecordView | null> {
    const record = await this.repo.findById(id);
    if (!record) return null;
    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
    };
  }
}
