import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FinancialPriority } from '../../../domain/enums/financial-priority.enum';
import { FinancialType } from '../../../domain/enums/financial-type.enum';

@Entity('financial_records')
@Index('idx_financial_records_user_date', ['userId', 'date'])
export class FinancialRecordOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: FinancialType,
    enumName: 'financial_records_type_enum',
  })
  type: FinancialType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'amount_usd',
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  amountUsd: string;

  @Column({
    type: 'enum',
    enum: FinancialPriority,
    enumName: 'financial_records_priority_enum',
    nullable: true,
  })
  priority: FinancialPriority | null;

  @Column({
    name: 'interest_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  interestRate: string | null;

  @Column({ type: 'date', nullable: true })
  date: string | null;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_day', type: 'integer', nullable: true })
  recurrenceDay: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
