import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';

export class SearchNotificationsFiltersDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean | null;

  @ApiPropertyOptional({ enum: NotificationStatus, nullable: true })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus | null;

  @ApiPropertyOptional({ example: 'financial_due_reminder', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string | null;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDateFrom?: string | null;

  @ApiPropertyOptional({ example: '2026-06-30', nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDateTo?: string | null;
}

export class SearchNotificationsDto {
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

  @ApiPropertyOptional({ type: SearchNotificationsFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchNotificationsFiltersDto)
  filters?: SearchNotificationsFiltersDto;
}
