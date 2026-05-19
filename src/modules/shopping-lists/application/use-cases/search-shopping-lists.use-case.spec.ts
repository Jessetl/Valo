import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { SearchShoppingListsUseCase } from './search-shopping-lists.use-case';

describe('SearchShoppingListsUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let useCase: SearchShoppingListsUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      searchByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;
    useCase = new SearchShoppingListsUseCase(repo);
  });

  it('aplica defaults page=1, limit=20', async () => {
    repo.searchByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute({ userId: 'u1', dto: {} as never });

    expect(repo.searchByUserId).toHaveBeenCalledWith('u1', {}, 1, 20);
  });

  it('clampa limit a max 100', async () => {
    repo.searchByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    });

    await useCase.execute({
      userId: 'u1',
      dto: { limit: 999 } as never,
    });

    expect(repo.searchByUserId).toHaveBeenCalledWith('u1', {}, 1, 100);
  });

  it('clampa page minimo a 1', async () => {
    repo.searchByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute({ userId: 'u1', dto: { page: 0 } as never });

    expect(repo.searchByUserId.mock.calls[0][2]).toBe(1);
  });

  it('userId del token siempre se pasa al repo (no overridable via dto)', async () => {
    repo.searchByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute({
      userId: 'token-user',
      dto: { filters: { storeName: 'foo' } } as never,
    });

    expect(repo.searchByUserId).toHaveBeenCalledWith(
      'token-user',
      expect.objectContaining({ storeName: 'foo' }),
      1,
      20,
    );
  });

  it('mapea entity a summary con itemsCount + checkedCount derivados', async () => {
    const item1 = ShoppingItem.create(
      'i1',
      'l1',
      'A',
      'C',
      10,
      1,
      null,
      36.5,
      true,
    );
    const item2 = ShoppingItem.create(
      'i2',
      'l1',
      'B',
      'C',
      5,
      1,
      null,
      36.5,
      false,
    );
    const list = ShoppingList.create({
      id: 'l1',
      userId: 'u1',
      name: 'Lista',
      listType: ShoppingListType.TEMPLATE,
      countryCode: 'VE',
      currencyCode: 'VES',
      exchangeRateSnapshot: 36.5,
      items: [item1, item2],
    });

    repo.searchByUserId.mockResolvedValue({
      data: [list],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ userId: 'u1', dto: {} as never });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].itemsCount).toBe(2);
    expect(result.data[0].checkedCount).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });
});
