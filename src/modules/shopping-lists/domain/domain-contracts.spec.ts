import { describe, expect, it, jest } from '@jest/globals';
import { ShoppingItemNotFoundException } from './exceptions/shopping-item-not-found.exception';
import { ShoppingListNotFoundException } from './exceptions/shopping-list-not-found.exception';
import {
  SHOPPING_LIST_REPOSITORY,
  type IShoppingListRepository,
} from './interfaces/repositories/shopping-list.repository.interface';

describe('Shopping lists domain contracts', () => {
  it('expone token symbol estable para DI', () => {
    expect(typeof SHOPPING_LIST_REPOSITORY).toBe('symbol');
    expect(String(SHOPPING_LIST_REPOSITORY)).toContain(
      'SHOPPING_LIST_REPOSITORY',
    );
  });

  it('crea excepciones not-found con mensaje esperado', () => {
    const listError = new ShoppingListNotFoundException('list-404');
    const itemError = new ShoppingItemNotFoundException('item-404');

    expect(listError.name).toBe('ShoppingListNotFoundException');
    expect(listError.message).toContain(
      'ShoppingList con identificador "list-404" no encontrado',
    );

    expect(itemError.name).toBe('ShoppingItemNotFoundException');
    expect(itemError.message).toContain(
      'ShoppingItem con identificador "item-404" no encontrado',
    );
  });

  it('mantiene compatibilidad de tipo en interfaz del repositorio', () => {
    const repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      findCompletedByUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      getSpendingStats: jest.fn(),
      save: jest.fn(),
      addItemsToList: jest.fn(),
      delete: jest.fn(),
    } as unknown as IShoppingListRepository;

    expect(repo).toBeDefined();
  });
});
