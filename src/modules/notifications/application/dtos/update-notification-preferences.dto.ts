import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ example: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'push_enabled' })
  push_enabled?: boolean | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'debt_reminders' })
  debt_reminders?: boolean | null;

  @ApiPropertyOptional({ example: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'price_alerts' })
  price_alerts?: boolean | null;

  @ApiPropertyOptional({ example: true, nullable: true })
  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'list_reminders' })
  list_reminders?: boolean | null;
}
