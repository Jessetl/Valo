import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export class FinancialRecordSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Alquiler' })
  title!: string;

  @ApiProperty({ example: 'EXPENSE' })
  type!: string;

  @ApiProperty({ example: 3618000.0 })
  amount_local!: number;

  @ApiProperty({ example: 100.0 })
  amount_usd!: number;

  @ApiProperty({ example: '2026-06-15' })
  date!: string;
}

export class NotificationListItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'financial_due_reminder' })
  type!: string;

  @ApiProperty({ example: '2026-06-14' })
  scheduled_at!: string;

  @ApiPropertyOptional({ example: '2026-06-14', nullable: true })
  sent_at!: string | null;

  @ApiProperty({ enum: NotificationStatus, example: NotificationStatus.SENT })
  status!: NotificationStatus;

  @ApiProperty({ example: false })
  is_read!: boolean;

  @ApiProperty({ type: FinancialRecordSummaryDto })
  financial_record!: FinancialRecordSummaryDto;
}
