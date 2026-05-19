import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  financial_id!: string;

  @ApiProperty({ example: 'financial_due_reminder' })
  type!: string;

  @ApiProperty({ example: '2026-06-14' })
  scheduled_at!: string;

  @ApiPropertyOptional({ example: '2026-06-14', nullable: true })
  sent_at!: string | null;

  @ApiProperty({
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;

  @ApiProperty({ example: false })
  is_read!: boolean;
}
