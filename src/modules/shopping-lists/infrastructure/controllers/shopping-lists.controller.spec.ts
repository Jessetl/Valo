import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AddItemsToShoppingListUseCase } from '../../application/use-cases/add-items-to-shopping-list.use-case';
import { CompareShoppingListsUseCase } from '../../application/use-cases/compare-shopping-lists.use-case';
import { CompleteShoppingListUseCase } from '../../application/use-cases/complete-shopping-list.use-case';
import { CreateShoppingListUseCase } from '../../application/use-cases/create-shopping-list.use-case';
import { DeleteShoppingItemUseCase } from '../../application/use-cases/delete-shopping-item.use-case';
import { DeleteShoppingListUseCase } from '../../application/use-cases/delete-shopping-list.use-case';
import { DuplicateShoppingListUseCase } from '../../application/use-cases/duplicate-shopping-list.use-case';
import { EditShoppingItemUseCase } from '../../application/use-cases/edit-shopping-item.use-case';
import { GetShoppingListByIdUseCase } from '../../application/use-cases/get-shopping-list-by-id.use-case';
import { GetShoppingListHistoryUseCase } from '../../application/use-cases/get-shopping-list-history.use-case';
import { GetShoppingListsUseCase } from '../../application/use-cases/get-shopping-lists.use-case';
import { GetSpendingStatsUseCase } from '../../application/use-cases/get-spending-stats.use-case';
import { ToggleShoppingItemUseCase } from '../../application/use-cases/toggle-shopping-item.use-case';
import { UpdateShoppingListUseCase } from '../../application/use-cases/update-shopping-list.use-case';
import { ShoppingListsController } from './shopping-lists.controller';

type ExecMock = { execute: jest.Mock<(...args: unknown[]) => Promise<any>> };

function makeExecMock(): ExecMock {
  return { execute: jest.fn() };
}

describe('ShoppingListsController', () => {
  let createShoppingList: ExecMock;
  let getShoppingLists: ExecMock;
  let getShoppingListById: ExecMock;
  let updateShoppingList: ExecMock;
  let deleteShoppingList: ExecMock;
  let addItemsToShoppingList: ExecMock;
  let editShoppingItem: ExecMock;
  let deleteShoppingItem: ExecMock;
  let toggleShoppingItem: ExecMock;
  let completeShoppingList: ExecMock;
  let getShoppingListHistory: ExecMock;
  let duplicateShoppingList: ExecMock;
  let compareShoppingLists: ExecMock;
  let getSpendingStats: ExecMock;

  let controller: ShoppingListsController;

  const userId = 'user-1';

  beforeEach(() => {
    createShoppingList = makeExecMock();
    getShoppingLists = makeExecMock();
    getShoppingListById = makeExecMock();
    updateShoppingList = makeExecMock();
    deleteShoppingList = makeExecMock();
    addItemsToShoppingList = makeExecMock();
    editShoppingItem = makeExecMock();
    deleteShoppingItem = makeExecMock();
    toggleShoppingItem = makeExecMock();
    completeShoppingList = makeExecMock();
    getShoppingListHistory = makeExecMock();
    duplicateShoppingList = makeExecMock();
    compareShoppingLists = makeExecMock();
    getSpendingStats = makeExecMock();

    controller = new ShoppingListsController(
      createShoppingList as unknown as CreateShoppingListUseCase,
      getShoppingLists as unknown as GetShoppingListsUseCase,
      getShoppingListById as unknown as GetShoppingListByIdUseCase,
      updateShoppingList as unknown as UpdateShoppingListUseCase,
      deleteShoppingList as unknown as DeleteShoppingListUseCase,
      addItemsToShoppingList as unknown as AddItemsToShoppingListUseCase,
      editShoppingItem as unknown as EditShoppingItemUseCase,
      deleteShoppingItem as unknown as DeleteShoppingItemUseCase,
      toggleShoppingItem as unknown as ToggleShoppingItemUseCase,
      completeShoppingList as unknown as CompleteShoppingListUseCase,
      getShoppingListHistory as unknown as GetShoppingListHistoryUseCase,
      duplicateShoppingList as unknown as DuplicateShoppingListUseCase,
      compareShoppingLists as unknown as CompareShoppingListsUseCase,
      getSpendingStats as unknown as GetSpendingStatsUseCase,
    );
  });

  it('create delega payload al use case', async () => {
    createShoppingList.execute.mockResolvedValue({ id: 'list-1' });

    const dto = { name: 'Compra' };
    const result = await controller.create(userId, dto as never);

    expect(createShoppingList.execute).toHaveBeenCalledWith({ userId, dto });
    expect(result).toEqual({ id: 'list-1' });
  });

  it('history normaliza page y limit', async () => {
    getShoppingListHistory.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
    });

    await controller.history(userId, '0', '500');

    expect(getShoppingListHistory.execute).toHaveBeenCalledWith({
      userId,
      page: 1,
      limit: 50,
    });
  });

  it('history aplica defaults cuando page/limit no vienen', async () => {
    getShoppingListHistory.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await controller.history(userId, undefined, undefined);

    expect(getShoppingListHistory.execute).toHaveBeenCalledWith({
      userId,
      page: 1,
      limit: 10,
    });
  });

  it('compare parsea ids y elimina vacios', async () => {
    compareShoppingLists.execute.mockResolvedValue({ comparisons: [] });

    await controller.compare(userId, ' id1, ,id2 ,');

    expect(compareShoppingLists.execute).toHaveBeenCalledWith({
      userId,
      ids: ['id1', 'id2'],
    });
  });

  it('compare usa arreglo vacio cuando ids es undefined', async () => {
    compareShoppingLists.execute.mockResolvedValue({ comparisons: [] });

    await controller.compare(userId, undefined as never);

    expect(compareShoppingLists.execute).toHaveBeenCalledWith({
      userId,
      ids: [],
    });
  });

  it('stats usa period month por defecto y week cuando aplica', async () => {
    getSpendingStats.execute.mockResolvedValue({ period: 'month', stats: [] });

    await controller.stats(userId, 'invalid');
    expect(getSpendingStats.execute).toHaveBeenLastCalledWith({
      userId,
      period: 'month',
    });

    await controller.stats(userId, 'week');
    expect(getSpendingStats.execute).toHaveBeenLastCalledWith({
      userId,
      period: 'week',
    });
  });

  it('findAll delega userId', async () => {
    getShoppingLists.execute.mockResolvedValue([]);

    await controller.findAll(userId);

    expect(getShoppingLists.execute).toHaveBeenCalledWith(userId);
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

  it('remove delega payload', async () => {
    deleteShoppingList.execute.mockResolvedValue({ message: 'ok' });

    await controller.remove(userId, 'list-1');

    expect(deleteShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
    });
  });

  it('duplicate delega payload', async () => {
    duplicateShoppingList.execute.mockResolvedValue({ id: 'list-2' });

    await controller.duplicate(userId, 'list-1');

    expect(duplicateShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
    });
  });

  it('complete delega payload', async () => {
    completeShoppingList.execute.mockResolvedValue({
      id: 'list-1',
      status: 'COMPLETED',
    });

    await controller.complete(userId, 'list-1');

    expect(completeShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
    });
  });

  it('addItems delega payload', async () => {
    addItemsToShoppingList.execute.mockResolvedValue([]);

    await controller.addItems(userId, 'list-1', {
      items: [
        { productName: 'P', category: 'C', unitPriceLocal: 1, totalLocal: 1 },
      ],
    } as never);

    expect(addItemsToShoppingList.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      userId,
      items: [
        { productName: 'P', category: 'C', unitPriceLocal: 1, totalLocal: 1 },
      ],
    });
  });

  it('editItem delega payload', async () => {
    editShoppingItem.execute.mockResolvedValue({ id: 'list-1' });

    const dto = { productName: 'P', category: 'C', unitPriceLocal: 2 };
    await controller.editItem(userId, 'list-1', 'item-1', dto as never);

    expect(editShoppingItem.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      itemId: 'item-1',
      userId,
      dto,
    });
  });

  it('removeItem delega payload', async () => {
    deleteShoppingItem.execute.mockResolvedValue({ id: 'list-1' });

    await controller.removeItem(userId, 'list-1', 'item-1');

    expect(deleteShoppingItem.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      itemId: 'item-1',
      userId,
    });
  });

  it('toggleItem delega payload', async () => {
    toggleShoppingItem.execute.mockResolvedValue({ id: 'list-1' });

    await controller.toggleItem(userId, 'list-1', 'item-1');

    expect(toggleShoppingItem.execute).toHaveBeenCalledWith({
      listId: 'list-1',
      itemId: 'item-1',
      userId,
    });
  });
});
