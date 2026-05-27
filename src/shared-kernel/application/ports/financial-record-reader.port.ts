export const FINANCIAL_RECORD_READER = Symbol('FINANCIAL_RECORD_READER');

export interface FinancialRecordView {
  id: string;
  userId: string;
  title: string;
  type: string;
  amountUsd: number;
  date: Date;
}

export interface IFinancialRecordReader {
  findById(id: string): Promise<FinancialRecordView | null>;
  findByIds(ids: string[]): Promise<FinancialRecordView[]>;
}
