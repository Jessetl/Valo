import { BaseEntity } from '../../../../shared-kernel/domain/base-entity';
import { FinancialPriority } from '../enums/financial-priority.enum';
import { FinancialType } from '../enums/financial-type.enum';

export interface FinancialRecordProps {
  userId: string;
  type: FinancialType;
  title: string;
  description: string | null;
  amountLocal: number;
  amountUsd: number;
  priority: FinancialPriority | null;
  interestRate: number | null;
  date: Date;
  isRecurring: boolean;
  recurrenceDay: number | null;
}

export class FinancialRecord extends BaseEntity {
  readonly userId: string;
  readonly type: FinancialType;
  readonly title: string;
  readonly description: string | null;
  readonly amountLocal: number;
  readonly amountUsd: number;
  readonly priority: FinancialPriority | null;
  readonly interestRate: number | null;
  readonly date: Date;
  readonly isRecurring: boolean;
  readonly recurrenceDay: number | null;

  private constructor(id: string, props: FinancialRecordProps) {
    super(id);
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.amountLocal = props.amountLocal;
    this.amountUsd = props.amountUsd;
    this.priority = props.priority;
    this.interestRate = props.interestRate;
    this.date = props.date;
    this.isRecurring = props.isRecurring;
    this.recurrenceDay = props.recurrenceDay;
  }

  static create(
    id: string,
    userId: string,
    type: FinancialType,
    title: string,
    amountLocal: number,
    amountUsd: number,
    date: Date,
    options: {
      description?: string | null;
      priority?: FinancialPriority | null;
      interestRate?: number | null;
      isRecurring?: boolean;
      recurrenceDay?: number | null;
    } = {},
  ): FinancialRecord {
    const isRecurring = options.isRecurring ?? false;
    const recurrenceDay = isRecurring ? (options.recurrenceDay ?? null) : null;

    return new FinancialRecord(id, {
      userId,
      type,
      title,
      description: options.description ?? null,
      amountLocal,
      amountUsd,
      priority: options.priority ?? null,
      interestRate: options.interestRate ?? null,
      date,
      isRecurring,
      recurrenceDay,
    });
  }

  update(props: {
    type?: FinancialType;
    title?: string;
    description?: string | null;
    amountLocal?: number;
    amountUsd?: number;
    priority?: FinancialPriority | null;
    interestRate?: number | null;
    date?: Date;
    isRecurring?: boolean;
    recurrenceDay?: number | null;
  }): FinancialRecord {
    const nextIsRecurring = props.isRecurring ?? this.isRecurring;
    const incomingRecurrenceDay =
      props.recurrenceDay !== undefined
        ? props.recurrenceDay
        : this.recurrenceDay;
    const nextRecurrenceDay = nextIsRecurring ? incomingRecurrenceDay : null;

    return new FinancialRecord(this.id, {
      userId: this.userId,
      type: props.type ?? this.type,
      title: props.title ?? this.title,
      description:
        props.description !== undefined ? props.description : this.description,
      amountLocal: props.amountLocal ?? this.amountLocal,
      amountUsd: props.amountUsd ?? this.amountUsd,
      priority: props.priority !== undefined ? props.priority : this.priority,
      interestRate:
        props.interestRate !== undefined
          ? props.interestRate
          : this.interestRate,
      date: props.date ?? this.date,
      isRecurring: nextIsRecurring,
      recurrenceDay: nextRecurrenceDay,
    });
  }

  static reconstitute(
    id: string,
    props: FinancialRecordProps,
  ): FinancialRecord {
    return new FinancialRecord(id, props);
  }
}
