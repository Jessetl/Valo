import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';

export class FinancialSummaryUpcomingExpenseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Alquiler' })
  title!: string;

  @ApiProperty({ example: 3618000.0 })
  amountLocal!: number;

  @ApiProperty({ example: 100.0 })
  amountUsd!: number;

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
  totalIncomeLocal!: number;

  @ApiProperty({ example: 0.0 })
  totalIncomeUsd!: number;

  @ApiProperty({ example: 0.0 })
  totalExpenseLocal!: number;

  @ApiProperty({ example: 0.0 })
  totalExpenseUsd!: number;

  @ApiProperty({ example: 0.0 })
  netBalanceLocal!: number;

  @ApiProperty({ example: 0.0 })
  netBalanceUsd!: number;

  @ApiProperty({ type: [FinancialSummaryUpcomingExpenseDto] })
  upcomingExpenses!: FinancialSummaryUpcomingExpenseDto[];
}

export class FinancialSummaryQueryDto {
  @ApiPropertyOptional({ example: 6, minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ example: 2026, minimum: 2000, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
