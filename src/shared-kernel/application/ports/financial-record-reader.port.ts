export const FINANCIAL_RECORD_READER = Symbol('FINANCIAL_RECORD_READER');

export interface FinancialRecordView {
  id: string;
  userId: string;
  title: string;
}

export interface IFinancialRecordReader {
  findById(id: string): Promise<FinancialRecordView | null>;
}
