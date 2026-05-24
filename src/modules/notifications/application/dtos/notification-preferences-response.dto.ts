import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesResponseDto {
  @ApiProperty({ example: true })
  pushEnabled!: boolean;

  @ApiProperty({ example: true })
  debtReminders!: boolean;

  @ApiProperty({ example: false })
  priceAlerts!: boolean;

  @ApiProperty({ example: true })
  listReminders!: boolean;
}
