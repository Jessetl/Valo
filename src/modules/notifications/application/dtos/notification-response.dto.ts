import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  userId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  financialId!: string;

  @ApiProperty({ example: 'financial_due_reminder' })
  type!: string;

  @ApiProperty({ example: '2026-06-14' })
  scheduledAt!: string;

  @ApiPropertyOptional({ example: '2026-06-14', nullable: true })
  sentAt!: string | null;

  @ApiProperty({
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;

  @ApiProperty({ example: false })
  isRead!: boolean;
}
