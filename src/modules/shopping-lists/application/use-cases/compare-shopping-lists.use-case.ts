import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { CompareShoppingListsDto } from '../dtos/compare-shopping-lists.dto';
import {
  CompareListMetaDto,
  CompareShoppingListsResponseDto,
  CompareSummaryDto,
  MatchedItemDto,
  UnmatchedItemDto,
  UnmatchedItemsDto,
} from '../dtos/compare-shopping-lists-response.dto';

interface CompareShoppingListsInput {
  userId: string;
  dto: CompareShoppingListsDto;
}

@Injectable()
export class CompareShoppingListsUseCase implements UseCase<
  CompareShoppingListsInput,
  CompareShoppingListsResponseDto
> {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly shoppingListRepository: IShoppingListRepository,
  ) {}

  async execute(
    input: CompareShoppingListsInput,
  ): Promise<CompareShoppingListsResponseDto> {
    const { listAId, listBId } = input.dto;

    const lists = await this.shoppingListRepository.findByIdsAndUserId(
      [listAId, listBId],
      input.userId,
    );

    if (listAId === listBId) {
      throw new ShoppingListNotFoundException(listBId);
    }

    const listA = lists.find((l) => l.id === listAId);
    const listB = lists.find((l) => l.id === listBId);

    // anti-enumeration: si falta cualquiera (no existe O no pertenece al user)
    // no distinguir cual fallo en el mensaje
    if (!listA || !listB) {
      throw new ShoppingListNotFoundException('compare-target');
    }

    const indexA = this.indexByProductName(listA.items);
    const indexB = this.indexByProductName(listB.items);

    const matchedItems: MatchedItemDto[] = [];
    const onlyInListA: UnmatchedItemDto[] = [];
    const onlyInListB: UnmatchedItemDto[] = [];

    for (const [key, itemA] of indexA) {
      const itemB = indexB.get(key);
      if (itemB) {
        matchedItems.push(this.buildMatched(itemA, itemB));
      } else {
        onlyInListA.push(this.toUnmatched(itemA));
      }
    }

    for (const [key, itemB] of indexB) {
      if (!indexA.has(key)) onlyInListB.push(this.toUnmatched(itemB));
    }

    const summary = this.buildSummary(
      matchedItems,
      onlyInListA.length,
      onlyInListB.length,
    );

    const response = new CompareShoppingListsResponseDto();
    response.listA = this.toListMeta(listA);
    response.listB = this.toListMeta(listB);
    response.matchedItems = matchedItems;
    const unmatched = new UnmatchedItemsDto();
    unmatched.onlyInListA = onlyInListA;
    unmatched.onlyInListB = onlyInListB;
    response.unmatchedItems = unmatched;
    response.summary = summary;
    return response;
  }

  private indexByProductName(items: ShoppingItem[]): Map<string, ShoppingItem> {
    const map = new Map<string, ShoppingItem>();
    for (const item of items) {
      const key = item.productName.trim().toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
    return map;
  }

  private buildMatched(a: ShoppingItem, b: ShoppingItem): MatchedItemDto {
    const dto = new MatchedItemDto();
    dto.productName = a.productName;
    dto.category = a.category;
    dto.listAPriceLocal = a.unitPriceLocal;
    dto.listAPriceUsd = a.unitPriceUsd;
    dto.listAQuantity = a.quantity;
    dto.listBPriceLocal = b.unitPriceLocal;
    dto.listBPriceUsd = b.unitPriceUsd;
    dto.listBQuantity = b.quantity;
    dto.priceDiffLocal =
      a.unitPriceLocal !== null && b.unitPriceLocal !== null
        ? round2(a.unitPriceLocal - b.unitPriceLocal)
        : null;
    dto.priceDiffUsd =
      a.unitPriceUsd !== null && b.unitPriceUsd !== null
        ? round2(a.unitPriceUsd - b.unitPriceUsd)
        : null;
    if (dto.priceDiffLocal === null) dto.cheaperIn = 'equal';
    else if (dto.priceDiffLocal < 0) dto.cheaperIn = 'list_a';
    else if (dto.priceDiffLocal > 0) dto.cheaperIn = 'list_b';
    else dto.cheaperIn = 'equal';
    return dto;
  }

  private toUnmatched(item: ShoppingItem): UnmatchedItemDto {
    const dto = new UnmatchedItemDto();
    dto.productName = item.productName;
    dto.category = item.category;
    dto.quantity = item.quantity;
    dto.unitPriceLocal = item.unitPriceLocal;
    dto.unitPriceUsd = item.unitPriceUsd;
    return dto;
  }

  private toListMeta(list: ShoppingList): CompareListMetaDto {
    const dto = new CompareListMetaDto();
    dto.id = list.id;
    dto.name = list.name;
    dto.storeName = list.storeName;
    return dto;
  }

  private buildSummary(
    matched: MatchedItemDto[],
    unmatchedACount: number,
    unmatchedBCount: number,
  ): CompareSummaryDto {
    const listATotalLocal = round2(
      matched.reduce(
        (sum, m) => sum + (m.listAPriceLocal ?? 0) * m.listAQuantity,
        0,
      ),
    );
    const listBTotalLocal = round2(
      matched.reduce(
        (sum, m) => sum + (m.listBPriceLocal ?? 0) * m.listBQuantity,
        0,
      ),
    );

    const anyUsdMissing = matched.some(
      (m) => m.listAPriceUsd === null || m.listBPriceUsd === null,
    );
    const listATotalUsd = anyUsdMissing
      ? null
      : round2(
          matched.reduce(
            (sum, m) => sum + (m.listAPriceUsd ?? 0) * m.listAQuantity,
            0,
          ),
        );
    const listBTotalUsd = anyUsdMissing
      ? null
      : round2(
          matched.reduce(
            (sum, m) => sum + (m.listBPriceUsd ?? 0) * m.listBQuantity,
            0,
          ),
        );

    const dto = new CompareSummaryDto();
    dto.totalMatched = matched.length;
    dto.totalUnmatchedA = unmatchedACount;
    dto.totalUnmatchedB = unmatchedBCount;
    dto.listATotalLocal = listATotalLocal;
    dto.listBTotalLocal = listBTotalLocal;
    dto.savingsLocal = round2(Math.abs(listATotalLocal - listBTotalLocal));
    dto.savingsUsd =
      listATotalUsd !== null && listBTotalUsd !== null
        ? round2(Math.abs(listATotalUsd - listBTotalUsd))
        : null;
    if (listATotalLocal < listBTotalLocal) dto.recommended = 'list_a';
    else if (listATotalLocal > listBTotalLocal) dto.recommended = 'list_b';
    else dto.recommended = 'equal';
    return dto;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
