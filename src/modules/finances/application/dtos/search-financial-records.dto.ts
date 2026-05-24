import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { FinancialPriority } from '../../domain/enums/financial-priority.enum';
import { FinancialType } from '../../domain/enums/financial-type.enum';

export class SearchFinancialRecordsFiltersDto {
  @ApiPropertyOptional({ enum: FinancialType, nullable: true })
  @IsOptional()
  @IsEnum(FinancialType)
  type?: FinancialType | null;

  @ApiPropertyOptional({ enum: FinancialPriority, nullable: true })
  @IsOptional()
  @IsEnum(FinancialPriority)
  priority?: FinancialPriority | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean | null;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string | null;

  @ApiPropertyOptional({ example: '2026-06-30', nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string | null;
}

export class SearchFinancialRecordsDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ type: SearchFinancialRecordsFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchFinancialRecordsFiltersDto)
  filters?: SearchFinancialRecordsFiltersDto;
}
