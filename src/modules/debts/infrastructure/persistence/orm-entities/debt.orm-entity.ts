import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../auth/infrastructure/persistence/orm-entities/user.orm-entity';
import { DebtPriority } from '../../../domain/enums/debt-priority.enum';

@Entity('debts')
export class DebtOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

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
  amountUsd: number;

  @Column({
    type: 'enum',
    enum: DebtPriority,
    default: DebtPriority.MEDIUM,
  })
  priority: DebtPriority;

  @Column({
    name: 'interest_rate_pct',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  interestRatePct: number;

  @Column({
    name: 'interest_amount_usd',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  interestAmountUsd: number;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'is_paid', type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ name: 'is_collection', type: 'boolean', default: false })
  isCollection: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;
}
