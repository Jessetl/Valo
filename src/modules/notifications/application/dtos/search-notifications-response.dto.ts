import { ApiProperty } from '@nestjs/swagger';
import { NotificationListItemDto } from './notification-list-item.dto';

export class SearchNotificationsMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 2 })
  total_pages!: number;
}

export class SearchNotificationsResponseDto {
  @ApiProperty({ type: [NotificationListItemDto] })
  data!: NotificationListItemDto[];

  @ApiProperty({ type: SearchNotificationsMetaDto })
  meta!: SearchNotificationsMetaDto;
}
