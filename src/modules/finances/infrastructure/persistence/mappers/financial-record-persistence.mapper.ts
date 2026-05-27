import { FinancialRecord } from '../../../domain/entities/financial-record.entity';
import { FinancialRecordOrmEntity } from '../orm-entities/financial-record.orm-entity';

function toUtcDate(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export class FinancialRecordPersistenceMapper {
  static toDomain(orm: FinancialRecordOrmEntity): FinancialRecord {
    return FinancialRecord.reconstitute(orm.id, {
      userId: orm.userId,
      type: orm.type,
      title: orm.title,
      description: orm.description,
      amountUsd: Number(orm.amountUsd),
      priority: orm.priority,
      interestRate: orm.interestRate !== null ? Number(orm.interestRate) : null,
      date: orm.date ? toUtcDate(orm.date) : null,
      isRecurring: orm.isRecurring,
      recurrenceDay: orm.recurrenceDay,
    });
  }

  static toOrm(record: FinancialRecord): FinancialRecordOrmEntity {
    const orm = new FinancialRecordOrmEntity();
    orm.id = record.id;
    orm.userId = record.userId;
    orm.type = record.type;
    orm.title = record.title;
    orm.description = record.description;
    orm.amountUsd = record.amountUsd.toFixed(2);
    orm.priority = record.priority;
    orm.interestRate =
      record.interestRate !== null ? record.interestRate.toFixed(2) : null;
    orm.date = record.date ? toDateOnly(record.date) : null;
    orm.isRecurring = record.isRecurring;
    orm.recurrenceDay = record.recurrenceDay;
    return orm;
  }
}
