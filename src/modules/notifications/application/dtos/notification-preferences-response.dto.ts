import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesResponseDto {
  @ApiProperty({ example: true })
  push_enabled!: boolean;

  @ApiProperty({ example: true })
  debt_reminders!: boolean;

  @ApiProperty({ example: false })
  price_alerts!: boolean;

  @ApiProperty({ example: true })
  list_reminders!: boolean;
}
