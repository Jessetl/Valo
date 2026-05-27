import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { SearchShoppingListsDto } from '../dtos/search-shopping-lists.dto';
import {
  PaginatedShoppingListsResponseDto,
  PaginationMetaDto,
} from '../dtos/paginated-shopping-lists-response.dto';
import { ShoppingListSummaryDto } from '../dtos/shopping-list-summary.dto';
import { computeListTotals } from '../utils/totals.util';

interface SearchShoppingListsInput {
  userId: string;
  dto: SearchShoppingListsDto;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class SearchShoppingListsUseCase implements UseCase<
  SearchShoppingListsInput,
  PaginatedShoppingListsResponseDto
> {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly shoppingListRepository: IShoppingListRepository,
  ) {}

  async execute(
    input: SearchShoppingListsInput,
  ): Promise<PaginatedShoppingListsResponseDto> {
    const page = Math.max(DEFAULT_PAGE, input.dto.page ?? DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, input.dto.limit ?? DEFAULT_LIMIT),
    );

    const filters = input.dto.filters ?? {};
    const result = await this.shoppingListRepository.searchByUserId(
      input.userId,
      {
        listType: filters.listType,
        storeName: filters.storeName,
        scheduledDateFrom: filters.scheduledDateFrom
          ? new Date(filters.scheduledDateFrom)
          : undefined,
        scheduledDateTo: filters.scheduledDateTo
          ? new Date(filters.scheduledDateTo)
          : undefined,
      },
      page,
      limit,
    );

    const data = result.data.map((list) => this.toSummary(list));

    const meta = new PaginationMetaDto();
    meta.page = result.page;
    meta.limit = result.limit;
    meta.total = result.total;
    meta.totalPages = Math.max(1, Math.ceil(result.total / result.limit));

    const response = new PaginatedShoppingListsResponseDto();
    response.data = data;
    response.meta = meta;
    return response;
  }

  private toSummary(list: ShoppingList): ShoppingListSummaryDto {
    const totals = computeListTotals(list.items, list.ivaEnabled);
    const dto = new ShoppingListSummaryDto();
    dto.id = list.id;
    dto.name = list.name;
    dto.storeName = list.storeName;
    dto.listType = list.listType;
    dto.currencyCode = list.currencyCode;
    dto.scheduledDate = list.scheduledDate;
    dto.itemsCount = list.items.length;
    dto.checkedCount = list.items.filter((item) => item.isChecked).length;
    dto.totalLocal = totals.totalLocal;
    dto.totalUsd = totals.totalUsd;
    return dto;
  }
}
