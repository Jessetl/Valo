export const FINANCIAL_RECORD_CREATED = 'financial-record.created';
export const FINANCIAL_RECORD_UPDATED = 'financial-record.updated';
export const FINANCIAL_RECORD_DELETED = 'financial-record.deleted';

export class FinancialRecordCreatedEvent {
  constructor(
    public readonly financialId: string,
    public readonly userId: string,
    public readonly date: Date,
  ) {}
}

export class FinancialRecordUpdatedEvent {
  constructor(
    public readonly financialId: string,
    public readonly userId: string,
    public readonly dateChanged: boolean,
    public readonly date: Date | null,
  ) {}
}

export class FinancialRecordDeletedEvent {
  constructor(
    public readonly financialId: string,
    public readonly userId: string,
  ) {}
}
