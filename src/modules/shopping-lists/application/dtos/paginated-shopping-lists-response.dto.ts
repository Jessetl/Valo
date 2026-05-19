import { ApiProperty } from '@nestjs/swagger';
import { ShoppingListSummaryDto } from './shopping-list-summary.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 45 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class PaginatedShoppingListsResponseDto {
  @ApiProperty({ type: [ShoppingListSummaryDto] })
  data!: ShoppingListSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
