import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShoppingItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  listId!: string;

  @ApiProperty({ example: 'Harina PAN' })
  productName!: string;

  @ApiProperty({ example: 'Alimentos' })
  category!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiPropertyOptional({ example: 45.5, nullable: true })
  unitPriceLocal!: number | null;

  @ApiPropertyOptional({ example: 1.2, nullable: true })
  unitPriceUsd!: number | null;

  @ApiProperty({ example: false })
  isChecked!: boolean;
}
