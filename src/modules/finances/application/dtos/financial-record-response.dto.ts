import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';
import { FinancialType } from '../../domain/enums/financial-type.enum';
import { NotificationStatus } from '../../../notifications/domain/enums/notification-status.enum';

export class FinancialRecordNotificationDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '2026-06-14' })
  scheduled_at!: string;

  @ApiPropertyOptional({ example: '2026-06-14', nullable: true })
  sent_at!: string | null;

  @ApiProperty({
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;
}

export class FinancialRecordResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id!: string;

  @ApiProperty({ enum: FinancialType, example: FinancialType.EXPENSE })
  type!: FinancialType;

  @ApiProperty({ example: 'Alquiler' })
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: 3618000.0 })
  amount_local!: number;

  @ApiProperty({ example: 100.0 })
  amount_usd!: number;

  @ApiPropertyOptional({ enum: FinancialPriority, nullable: true })
  priority!: FinancialPriority | null;

  @ApiPropertyOptional({ example: 5.0, nullable: true })
  interest_rate!: number | null;

  @ApiProperty({ example: '2026-06-15' })
  date!: string;

  @ApiProperty({ example: false })
  is_recurring!: boolean;

  @ApiPropertyOptional({ example: 15, nullable: true })
  recurrence_day!: number | null;

  @ApiPropertyOptional({ type: FinancialRecordNotificationDto, nullable: true })
  notification!: FinancialRecordNotificationDto | null;
}
