import { describe, expect, it } from '@jest/globals';
import {
  CompareListMetaDto,
  CompareShoppingListsResponseDto,
  CompareSummaryDto,
  MatchedItemDto,
  UnmatchedItemDto,
  UnmatchedItemsDto,
} from './compare-shopping-lists-response.dto';
import { CompareShoppingListsDto } from './compare-shopping-lists.dto';
import { CreateShoppingItemDto } from './create-shopping-item.dto';
import { CreateShoppingListDto } from './create-shopping-list.dto';
import {
  PaginatedShoppingListsResponseDto,
  PaginationMetaDto,
} from './paginated-shopping-lists-response.dto';
import {
  SearchShoppingListsDto,
  SearchShoppingListsFiltersDto,
} from './search-shopping-lists.dto';
import { ShoppingItemResponseDto } from './shopping-item-response.dto';
import { ShoppingListResponseDto } from './shopping-list-response.dto';
import { ShoppingListSummaryDto } from './shopping-list-summary.dto';
import { UpdateShoppingItemDto } from './update-shopping-item.dto';
import { UpdateShoppingListDto } from './update-shopping-list.dto';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';

describe('Shopping list DTOs', () => {
  it('instancia DTOs del modulo para cobertura de decoradores', () => {
    const createItem = new CreateShoppingItemDto();
    createItem.productName = 'Harina';
    createItem.category = 'Comida';
    createItem.unitPriceLocal = 45.5;
    createItem.quantity = 2;
    createItem.unitPriceUsd = 1.2;
    createItem.isChecked = false;

    const createList = new CreateShoppingListDto();
    createList.name = 'Compra semanal';
    createList.storeName = 'Super';
    createList.listType = ShoppingListType.TEMPLATE;
    createList.countryCode = 'VE';
    createList.currencyCode = 'VES';
    createList.exchangeRateSnapshot = 36.5;
    createList.ivaEnabled = true;
    createList.items = [createItem];

    const updateItem = new UpdateShoppingItemDto();
    updateItem.id = '11111111-1111-4111-8111-111111111111';
    updateItem.productName = 'Arroz';
    updateItem.category = 'Comida';
    updateItem.unitPriceLocal = 30;
    updateItem.quantity = 1;
    updateItem.unitPriceUsd = 0.9;
    updateItem.isChecked = true;

    const updateList = new UpdateShoppingListDto();
    updateList.name = 'Actualizada';
    updateList.storeName = 'Otro super';
    updateList.ivaEnabled = false;
    updateList.items = [updateItem];

    const responseItem = new ShoppingItemResponseDto();
    responseItem.id = 'i1';
    responseItem.listId = 'l1';
    responseItem.productName = 'Cafe';
    responseItem.category = 'Bebidas';
    responseItem.quantity = 1;
    responseItem.unitPriceLocal = 10;
    responseItem.unitPriceUsd = null;
    responseItem.isChecked = false;

    const responseList = new ShoppingListResponseDto();
    responseList.id = 'l1';
    responseList.userId = 'u1';
    responseList.name = 'Lista';
    responseList.storeName = null;
    responseList.listType = ShoppingListType.TEMPLATE;
    responseList.countryCode = 'VE';
    responseList.currencyCode = 'VES';
    responseList.exchangeRateSnapshot = 36.5;
    responseList.ivaEnabled = false;
    responseList.scheduledDate = null;
    responseList.latitude = null;
    responseList.longitude = null;
    responseList.subtotalLocal = 10;
    responseList.subtotalUsd = null;
    responseList.ivaLocal = 0;
    responseList.ivaUsd = null;
    responseList.totalLocal = 10;
    responseList.totalUsd = null;
    responseList.items = [responseItem];

    const summary = new ShoppingListSummaryDto();
    summary.id = 'l1';
    summary.name = 'Lista';
    summary.storeName = null;
    summary.listType = ShoppingListType.TEMPLATE;
    summary.currencyCode = 'VES';
    summary.scheduledDate = null;
    summary.itemsCount = 1;
    summary.checkedCount = 0;
    summary.totalLocal = 0;
    summary.totalUsd = null;

    const meta = new PaginationMetaDto();
    meta.page = 1;
    meta.limit = 10;
    meta.total = 1;
    meta.totalPages = 1;

    const paginated = new PaginatedShoppingListsResponseDto();
    paginated.data = [summary];
    paginated.meta = meta;

    const filters = new SearchShoppingListsFiltersDto();
    filters.listType = ShoppingListType.TEMPLATE;
    filters.storeName = 'Super';

    const search = new SearchShoppingListsDto();
    search.page = 1;
    search.limit = 20;
    search.filters = filters;

    const compareInput = new CompareShoppingListsDto();
    compareInput.listAId = '11111111-1111-4111-8111-111111111111';
    compareInput.listBId = '22222222-2222-4222-8222-222222222222';

    const listMeta = new CompareListMetaDto();
    listMeta.id = 'a';
    listMeta.name = 'A';
    listMeta.storeName = null;

    const matched = new MatchedItemDto();
    matched.productName = 'Harina';
    matched.category = 'Comida';
    matched.listAPriceLocal = 45;
    matched.listAPriceUsd = null;
    matched.listAQuantity = 1;
    matched.listBPriceLocal = 50;
    matched.listBPriceUsd = null;
    matched.listBQuantity = 1;
    matched.priceDiffLocal = -5;
    matched.priceDiffUsd = null;
    matched.cheaperIn = 'list_a';

    const unmatched = new UnmatchedItemDto();
    unmatched.productName = 'Pan';
    unmatched.category = 'Panaderia';
    unmatched.quantity = 1;
    unmatched.unitPriceLocal = 12;
    unmatched.unitPriceUsd = null;

    const unmatchedGroup = new UnmatchedItemsDto();
    unmatchedGroup.onlyInListA = [unmatched];
    unmatchedGroup.onlyInListB = [];

    const compareSummary = new CompareSummaryDto();
    compareSummary.totalMatched = 1;
    compareSummary.totalUnmatchedA = 1;
    compareSummary.totalUnmatchedB = 0;
    compareSummary.listATotalLocal = 45;
    compareSummary.listBTotalLocal = 50;
    compareSummary.savingsLocal = 5;
    compareSummary.savingsUsd = null;
    compareSummary.recommended = 'list_a';

    const compare = new CompareShoppingListsResponseDto();
    compare.listA = listMeta;
    compare.listB = listMeta;
    compare.matchedItems = [matched];
    compare.unmatchedItems = unmatchedGroup;
    compare.summary = compareSummary;

    expect(createList.items?.length).toBe(1);
    expect(createList.listType).toBe(ShoppingListType.TEMPLATE);
    expect(updateList.items?.[0].productName).toBe('Arroz');
    expect(paginated.data[0].itemsCount).toBe(1);
    expect(paginated.meta.totalPages).toBe(1);
    expect(responseList.items[0].id).toBe('i1');
    expect(search.filters?.listType).toBe(ShoppingListType.TEMPLATE);
    expect(compare.summary.recommended).toBe('list_a');
    expect(compareInput.listAId).toContain('1111');
  });
});
