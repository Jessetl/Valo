import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { GetShoppingListByIdUseCase } from './get-shopping-list-by-id.use-case';

describe('GetShoppingListByIdUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let useCase: GetShoppingListByIdUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      searchByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;
    useCase = new GetShoppingListByIdUseCase(repo);
  });

  it('throws cuando lista no existe O pertenece a otro user (IDOR proteccion)', async () => {
    repo.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ listId: 'l1', userId: 'u-attacker' }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);

    expect(repo.findByIdAndUserId).toHaveBeenCalledWith('l1', 'u-attacker');
  });

  it('devuelve DTO completo cuando lista pertenece al user', async () => {
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

    const result = await useCase.execute({ listId: 'l1', userId: 'u1' });

    expect(result.id).toBe('l1');
    expect(result.userId).toBe('u1');
    expect(result.listType).toBe(ShoppingListType.TEMPLATE);
  });
});
