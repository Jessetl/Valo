import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../auth/infrastructure/persistence/orm-entities/user.orm-entity';
import { DebtOrmEntity } from '../../../../debts/infrastructure/persistence/orm-entities/debt.orm-entity';
import { NotificationStatus } from '../../../domain/enums/notification-status.enum';

@Entity('notifications')
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'debt_id', type: 'uuid' })
  debtId: string;

  @Column({ type: 'varchar', default: 'debt_due_reminder' })
  type: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @ManyToOne(() => DebtOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debt_id' })
  debt: DebtOrmEntity;
}
