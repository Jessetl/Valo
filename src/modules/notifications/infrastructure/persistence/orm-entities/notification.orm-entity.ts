import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationStatus } from '../../../../../shared-kernel/domain/enums/notification-status.enum';

@Entity('notifications')
@Index(['userId'])
@Index(['financialId'])
@Index(['status', 'scheduledAt'])
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'financial_id', type: 'uuid' })
  financialId: string;

  @Column({ type: 'varchar', default: 'financial_due_reminder' })
  type: string;

  @Column({ name: 'scheduled_at', type: 'date' })
  scheduledAt: Date;

  @Column({ name: 'sent_at', type: 'date', nullable: true })
  sentAt: Date | null;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    enumName: 'notifications_status_enum',
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
