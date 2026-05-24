import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';

export class ShoppingListSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Compra semanal' })
  name!: string;

  @ApiPropertyOptional({ example: 'Supermercado Central', nullable: true })
  storeName!: string | null;

  @ApiProperty({ enum: ShoppingListType })
  listType!: ShoppingListType;

  @ApiProperty({ example: 'VES' })
  currencyCode!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({
    example: '2026-04-15T18:00:00.000Z',
    nullable: true,
  })
  scheduledDate!: Date | null;

  @ApiProperty({ example: 12 })
  itemsCount!: number;

  @ApiProperty({ example: 5 })
  checkedCount!: number;

  @ApiProperty({
    example: 105.56,
    description:
      'Total local computed (subtotal + iva si ivaEnabled). Sobre todos los items.',
  })
  totalLocal!: number;

  @ApiPropertyOptional({
    example: 2.78,
    nullable: true,
    description: 'Total USD computed. null si algún item carece de USD.',
  })
  totalUsd!: number | null;
}
