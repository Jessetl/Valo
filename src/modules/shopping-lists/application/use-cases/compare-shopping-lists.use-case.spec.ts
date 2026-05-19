import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { CompareShoppingListsUseCase } from './compare-shopping-lists.use-case';

function makeList(
  id: string,
  userId: string,
  items: ShoppingItem[],
): ShoppingList {
  return ShoppingList.create({
    id,
    userId,
    name: `List-${id}`,
    listType: ShoppingListType.TEMPLATE,
    countryCode: 'VE',
    currencyCode: 'VES',
    exchangeRateSnapshot: 36.5,
    items,
  });
}

function makeItem(
  id: string,
  listId: string,
  product: string,
  price: number,
  qty = 1,
  priceUsd: number | null = null,
): ShoppingItem {
  // rate=null cuando priceUsd null para preservar null (sino entity auto-calcula)
  return ShoppingItem.create(
    id,
    listId,
    product,
    'Cat',
    price,
    qty,
    priceUsd,
    priceUsd === null ? null : 36.5,
    false,
  );
}

describe('CompareShoppingListsUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let useCase: CompareShoppingListsUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      searchByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;
    useCase = new CompareShoppingListsUseCase(repo);
  });

  it('IDOR: si ambas listas faltan (no existen O ajenas) → 404 sin distinguir', async () => {
    repo.findByIdsAndUserId.mockResolvedValue([]);

    await expect(
      useCase.execute({
        userId: 'u-attacker',
        dto: { listAId: 'a', listBId: 'b' } as never,
      }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
  });

  it('IDOR: si solo una lista pertenece al user → 404 anti-enumeration', async () => {
    repo.findByIdsAndUserId.mockResolvedValue([makeList('a', 'u1', [])]);

    await expect(
      useCase.execute({
        userId: 'u1',
        dto: { listAId: 'a', listBId: 'b-ajena' } as never,
      }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
  });

  it('rechaza listAId === listBId', async () => {
    repo.findByIdsAndUserId.mockResolvedValue([makeList('a', 'u1', [])]);

    await expect(
      useCase.execute({
        userId: 'u1',
        dto: { listAId: 'a', listBId: 'a' } as never,
      }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);
  });

  it('match case-insensitive + trim del product_name', async () => {
    const listA = makeList('a', 'u1', [makeItem('ia', 'a', '  Harina  ', 10)]);
    const listB = makeList('b', 'u1', [makeItem('ib', 'b', 'HARINA', 12)]);
    repo.findByIdsAndUserId.mockResolvedValue([listA, listB]);

    const result = await useCase.execute({
      userId: 'u1',
      dto: { listAId: 'a', listBId: 'b' } as never,
    });

    expect(result.matchedItems).toHaveLength(1);
    expect(result.unmatchedItems.onlyInListA).toHaveLength(0);
    expect(result.unmatchedItems.onlyInListB).toHaveLength(0);
  });

  it('cheaperIn = list_a cuando priceA < priceB', async () => {
    const listA = makeList('a', 'u1', [makeItem('ia', 'a', 'X', 10)]);
    const listB = makeList('b', 'u1', [makeItem('ib', 'b', 'X', 15)]);
    repo.findByIdsAndUserId.mockResolvedValue([listA, listB]);

    const result = await useCase.execute({
      userId: 'u1',
      dto: { listAId: 'a', listBId: 'b' } as never,
    });

    expect(result.matchedItems[0].cheaperIn).toBe('list_a');
    expect(result.matchedItems[0].priceDiffLocal).toBe(-5);
  });

  it('unmatched_items separa correctamente por lista de origen', async () => {
    const listA = makeList('a', 'u1', [
      makeItem('ia1', 'a', 'Solo-A', 10),
      makeItem('ia2', 'a', 'Comun', 5),
    ]);
    const listB = makeList('b', 'u1', [
      makeItem('ib1', 'b', 'Solo-B', 20),
      makeItem('ib2', 'b', 'Comun', 6),
    ]);
    repo.findByIdsAndUserId.mockResolvedValue([listA, listB]);

    const result = await useCase.execute({
      userId: 'u1',
      dto: { listAId: 'a', listBId: 'b' } as never,
    });

    expect(result.matchedItems).toHaveLength(1);
    expect(result.unmatchedItems.onlyInListA).toHaveLength(1);
    expect(result.unmatchedItems.onlyInListA[0].productName).toBe('Solo-A');
    expect(result.unmatchedItems.onlyInListB).toHaveLength(1);
    expect(result.unmatchedItems.onlyInListB[0].productName).toBe('Solo-B');
  });

  it('summary.recommended = lista mas barata en matched', async () => {
    const listA = makeList('a', 'u1', [makeItem('ia', 'a', 'X', 10)]);
    const listB = makeList('b', 'u1', [makeItem('ib', 'b', 'X', 30)]);
    repo.findByIdsAndUserId.mockResolvedValue([listA, listB]);

    const result = await useCase.execute({
      userId: 'u1',
      dto: { listAId: 'a', listBId: 'b' } as never,
    });

    expect(result.summary.recommended).toBe('list_a');
    expect(result.summary.savingsLocal).toBe(20);
  });

  it('savings_usd null si algun item carece de unitPriceUsd', async () => {
    const listA = makeList('a', 'u1', [makeItem('ia', 'a', 'X', 10, 1, null)]);
    const listB = makeList('b', 'u1', [makeItem('ib', 'b', 'X', 12, 1, 0.32)]);
    repo.findByIdsAndUserId.mockResolvedValue([listA, listB]);

    const result = await useCase.execute({
      userId: 'u1',
      dto: { listAId: 'a', listBId: 'b' } as never,
    });

    expect(result.summary.savingsUsd).toBeNull();
  });
});
