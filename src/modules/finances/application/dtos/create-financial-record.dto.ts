import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateFinancialRecordDto {
  @ApiProperty({ enum: FinancialType, example: FinancialType.EXPENSE })
  @IsEnum(FinancialType)
  type!: FinancialType;

  @ApiProperty({ example: 'Alquiler' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Pago mensual alquiler', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({ example: 3618000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount_local!: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount_usd!: number;

  @ApiPropertyOptional({
    enum: FinancialPriority,
    example: FinancialPriority.HIGH,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(FinancialPriority)
  priority?: FinancialPriority | null;

  @ApiPropertyOptional({ example: 5.0, nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interest_rate?: number | null;

  @ApiPropertyOptional({
    example: '2026-06-15',
    nullable: true,
    description:
      'Fecha del registro. Opcional: si se omite o es null, no se programa notificacion.',
  })
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @ApiPropertyOptional({ example: 15, minimum: 1, maximum: 31, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  recurrence_day?: number | null;
}
