import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { DeleteShoppingListUseCase } from './delete-shopping-list.use-case';

describe('DeleteShoppingListUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let useCase: DeleteShoppingListUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      searchByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;
    useCase = new DeleteShoppingListUseCase(repo);
  });

  it('throws cuando lista no existe / pertenece a otro user', async () => {
    repo.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ listId: 'l1', userId: 'u-attacker' }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);

    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('delete scoped a userId (defense-in-depth contra TOCTOU)', async () => {
    const list = ShoppingList.create({
      id: 'l1',
      userId: 'u1',
      name: 'Lista',
      listType: ShoppingListType.TEMPLATE,
      countryCode: 'VE',
      currencyCode: 'VES',
      exchangeRateSnapshot: 36.5,
    });
    repo.findByIdAndUserId.mockResolvedValue(list);

    await useCase.execute({ listId: 'l1', userId: 'u1' });

    expect(repo.delete).toHaveBeenCalledWith('l1', 'u1');
  });
});
