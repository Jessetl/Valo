import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';
import { FinancialType } from '../../domain/enums/financial-type.enum';
import { NotificationStatus } from '../../../../shared-kernel/domain/enums/notification-status.enum';

export class FinancialRecordSummaryItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ enum: FinancialType, example: FinancialType.EXPENSE })
  type!: FinancialType;

  @ApiProperty({ example: 'Alquiler' })
  title!: string;

  @ApiProperty({ example: 3618000.0 })
  amount_local!: number;

  @ApiProperty({ example: 100.0 })
  amount_usd!: number;

  @ApiPropertyOptional({ enum: FinancialPriority, nullable: true })
  priority!: FinancialPriority | null;

  @ApiProperty({ example: '2026-06-15' })
  date!: string;

  @ApiProperty({ example: false })
  is_recurring!: boolean;

  @ApiPropertyOptional({ enum: NotificationStatus, nullable: true })
  notification_status!: NotificationStatus | null;
}

export class SearchFinancialRecordsMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 35 })
  total!: number;

  @ApiProperty({ example: 2 })
  total_pages!: number;
}

export class SearchFinancialRecordsResponseDto {
  @ApiProperty({ type: [FinancialRecordSummaryItemDto] })
  data!: FinancialRecordSummaryItemDto[];

  @ApiProperty({ type: SearchFinancialRecordsMetaDto })
  meta!: SearchFinancialRecordsMetaDto;
}
