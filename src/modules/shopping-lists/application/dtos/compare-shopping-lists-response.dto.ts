import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompareListMetaDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Compra Enero' })
  name!: string;

  @ApiPropertyOptional({ example: 'Supermercado Central', nullable: true })
  storeName!: string | null;
}

export class MatchedItemDto {
  @ApiProperty({ example: 'Harina PAN' })
  productName!: string;

  @ApiProperty({ example: 'Comida' })
  category!: string;

  @ApiPropertyOptional({ example: 45.5, nullable: true })
  listAPriceLocal!: number | null;

  @ApiPropertyOptional({ example: 1.2, nullable: true })
  listAPriceUsd!: number | null;

  @ApiProperty({ example: 1 })
  listAQuantity!: number;

  @ApiPropertyOptional({ example: 50.0, nullable: true })
  listBPriceLocal!: number | null;

  @ApiPropertyOptional({ example: 1.3, nullable: true })
  listBPriceUsd!: number | null;

  @ApiProperty({ example: 1 })
  listBQuantity!: number;

  @ApiPropertyOptional({
    example: -4.5,
    description: 'priceA - priceB (negativo => A mas barato)',
    nullable: true,
  })
  priceDiffLocal!: number | null;

  @ApiPropertyOptional({ example: -0.1, nullable: true })
  priceDiffUsd!: number | null;

  @ApiProperty({ enum: ['list_a', 'list_b', 'equal'], example: 'list_a' })
  cheaperIn!: 'list_a' | 'list_b' | 'equal';
}

export class UnmatchedItemDto {
  @ApiProperty({ example: 'Pan campesino' })
  productName!: string;

  @ApiProperty({ example: 'Panaderia' })
  category!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiPropertyOptional({ example: 12.5, nullable: true })
  unitPriceLocal!: number | null;

  @ApiPropertyOptional({ example: 0.32, nullable: true })
  unitPriceUsd!: number | null;
}

export class UnmatchedItemsDto {
  @ApiProperty({ type: [UnmatchedItemDto] })
  onlyInListA!: UnmatchedItemDto[];

  @ApiProperty({ type: [UnmatchedItemDto] })
  onlyInListB!: UnmatchedItemDto[];
}

export class CompareSummaryDto {
  @ApiProperty({ example: 8 })
  totalMatched!: number;

  @ApiProperty({ example: 2 })
  totalUnmatchedA!: number;

  @ApiProperty({ example: 3 })
  totalUnmatchedB!: number;

  @ApiProperty({
    example: 320.5,
    description: 'Suma de items matched en lista A',
  })
  listATotalLocal!: number;

  @ApiProperty({ example: 340.0 })
  listBTotalLocal!: number;

  @ApiProperty({
    example: 19.5,
    description:
      'Diferencia absoluta entre totales (recommended ahorra esto vs el otro)',
  })
  savingsLocal!: number;

  @ApiPropertyOptional({ example: 0.52, nullable: true })
  savingsUsd!: number | null;

  @ApiProperty({ enum: ['list_a', 'list_b', 'equal'], example: 'list_a' })
  recommended!: 'list_a' | 'list_b' | 'equal';
}

export class CompareShoppingListsResponseDto {
  @ApiProperty({ type: CompareListMetaDto })
  listA!: CompareListMetaDto;

  @ApiProperty({ type: CompareListMetaDto })
  listB!: CompareListMetaDto;

  @ApiProperty({ type: [MatchedItemDto] })
  matchedItems!: MatchedItemDto[];

  @ApiProperty({ type: UnmatchedItemsDto })
  unmatchedItems!: UnmatchedItemsDto;

  @ApiProperty({ type: CompareSummaryDto })
  summary!: CompareSummaryDto;
}
