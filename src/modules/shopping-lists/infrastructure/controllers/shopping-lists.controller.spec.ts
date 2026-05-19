import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CompareShoppingListsUseCase } from '../../application/use-cases/compare-shopping-lists.use-case';
import { SearchShoppingListsUseCase } from '../../application/use-cases/search-shopping-lists.use-case';
import { CreateShoppingListUseCase } from '../../application/use-cases/create-shopping-list.use-case';
import { DeleteShoppingListUseCase } from '../../application/use-cases/delete-shopping-list.use-case';
import { GetShoppingListByIdUseCase } from '../../application/use-cases/get-shopping-list-by-id.use-case';
import { UpdateShoppingListUseCase } from '../../application/use-cases/update-shopping-list.use-case';
import { ShoppingListsController } from './shopping-lists.controller';

type ExecMock = { execute: jest.Mock<(...args: unknown[]) => Promise<any>> };

function makeExecMock(): ExecMock {
  return { execute: jest.fn() };
}

describe('ShoppingListsController', () => {
  let createShoppingList: ExecMock;
  let getShoppingListById: ExecMock;
  let updateShoppingList: ExecMock;
  let deleteShoppingList: ExecMock;
  let compareShoppingLists: ExecMock;
  let searchShoppingLists: ExecMock;

  let controller: ShoppingListsController;

  const userId = 'user-1';

  beforeEach(() => {
    createShoppingList = makeExecMock();
    getShoppingListById = makeExecMock();
    updateShoppingList = makeExecMock();
    deleteShoppingList = makeExecMock();
    compareShoppingLists = makeExecMock();
    searchShoppingLists = makeExecMock();

    controller = new ShoppingListsController(
      createShoppingList as unknown as CreateShoppingListUseCase,
      getShoppingListById as unknown as GetShoppingListByIdUseCase,
      updateShoppingList as unknown as UpdateShoppingListUseCase,
      deleteShoppingList as unknown as DeleteShoppingListUseCase,
      compareShoppingLists as unknown as CompareShoppingListsUseCase,
      searchShoppingLists as unknown as SearchShoppingListsUseCase,
    );
  });

  it('create delega payload al use case', async () => {
    createShoppingList.execute.mockResolvedValue({ id: 'list-1' });

    const dto = { name: 'Compra' };
    const result = await controller.create(userId, dto as never);

    expect(createShoppingList.execute).toHaveBeenCalledWith({ userId, dto });
    expect(result).toEqual({ id: 'list-1' });
  });

  it('findOne delega ids', async () => {
    getShoppingListById.execute.mockResolvedValue({ id: 'list-1' });

    await controller.findOne(userId, 'list-1');

    expect(getShoppingListById.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
    });
  });

  it('update delega payload', async () => {
    updateShoppingList.execute.mockResolvedValue({ id: 'list-1' });

    const dto = { name: 'Nueva' };
    await controller.update(userId, 'list-1', dto as never);

    expect(updateShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
      dto,
    });
  });

  it('remove delega payload y retorna void', async () => {
    deleteShoppingList.execute.mockResolvedValue(undefined);

    const result = await controller.remove(userId, 'list-1');

    expect(deleteShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
    });
    expect(result).toBeUndefined();
  });

  it('search delega payload al use case', async () => {
    searchShoppingLists.execute.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    const dto = { page: 1, limit: 20, filters: { isActive: true } };
    await controller.search(userId, dto as never);

    expect(searchShoppingLists.execute).toHaveBeenCalledWith({ userId, dto });
  });

  it('compare delega body al use case', async () => {
    compareShoppingLists.execute.mockResolvedValue({
      listA: { id: 'a', name: 'A', storeName: null },
      listB: { id: 'b', name: 'B', storeName: null },
      matchedItems: [],
      unmatchedItems: { onlyInListA: [], onlyInListB: [] },
      summary: {
        totalMatched: 0,
        totalUnmatchedA: 0,
        totalUnmatchedB: 0,
        listATotalLocal: 0,
        listBTotalLocal: 0,
        savingsLocal: 0,
        savingsUsd: 0,
        recommended: 'equal',
      },
    });

    const dto = { listAId: 'list-a', listBId: 'list-b' };
    await controller.compare(userId, dto as never);

    expect(compareShoppingLists.execute).toHaveBeenCalledWith({ userId, dto });
  });
});
