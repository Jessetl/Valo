import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';
import { FinancialType } from '../../domain/enums/financial-type.enum';

export class UpdateFinancialRecordDto {
  @ApiPropertyOptional({ enum: FinancialType })
  @IsOptional()
  @IsEnum(FinancialType)
  type?: FinancialType;

  @ApiPropertyOptional({ example: 'Alquiler' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 3618000.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount_local?: number;

  @ApiPropertyOptional({ example: 100.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount_usd?: number;

  @ApiPropertyOptional({ enum: FinancialPriority, nullable: true })
  @IsOptional()
  @IsEnum(FinancialPriority)
  priority?: FinancialPriority | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interest_rate?: number | null;

  @ApiPropertyOptional({ example: '2026-06-15', nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 31, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  recurrence_day?: number | null;
}
