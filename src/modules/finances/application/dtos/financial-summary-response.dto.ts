import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';

export class FinancialSummaryUpcomingExpenseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Alquiler' })
  title!: string;

  @ApiProperty({ example: 3618000.0 })
  amount_local!: number;

  @ApiProperty({ example: 100.0 })
  amount_usd!: number;

  @ApiProperty({ example: '2026-06-15', nullable: true })
  date!: string | null;

  @ApiPropertyOptional({ enum: FinancialPriority, nullable: true })
  priority!: FinancialPriority | null;
}

export class FinancialSummaryResponseDto {
  @ApiProperty({ example: 6 })
  month!: number;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 0.0 })
  total_income_local!: number;

  @ApiProperty({ example: 0.0 })
  total_income_usd!: number;

  @ApiProperty({ example: 0.0 })
  total_expense_local!: number;

  @ApiProperty({ example: 0.0 })
  total_expense_usd!: number;

  @ApiProperty({ example: 0.0 })
  net_balance_local!: number;

  @ApiProperty({ example: 0.0 })
  net_balance_usd!: number;

  @ApiProperty({ type: [FinancialSummaryUpcomingExpenseDto] })
  upcoming_expenses!: FinancialSummaryUpcomingExpenseDto[];
}

export class FinancialSummaryQueryDto {
  month?: number;
  year?: number;
}
