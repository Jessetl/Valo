import { describe, expect, it } from '@jest/globals';
import { ShoppingItemOrmEntity } from './shopping-item.orm-entity';
import { ShoppingListOrmEntity } from './shopping-list.orm-entity';

describe('Shopping list ORM entities', () => {
  it('instancia entidades ORM y asigna propiedades', () => {
    const list = new ShoppingListOrmEntity();
    list.id = 'list-1';
    list.userId = 'user-1';
    list.name = 'Compra';
    list.storeName = null;
    list.ivaEnabled = false;
    list.exchangeRateSnapshot = 20;
    list.createdAt = new Date('2026-04-01T00:00:00.000Z');
    list.updatedAt = new Date('2026-04-01T00:00:00.000Z');

    const item = new ShoppingItemOrmEntity();
    item.id = 'item-1';
    item.listId = 'list-1';
    item.productName = 'Harina';
    item.category = 'Comida';
    item.quantity = 2;
    item.unitPriceLocal = 50;
    item.unitPriceUsd = 2.5;
    item.isChecked = false;
    item.shoppingList = list;

    list.items = [item];

    expect(list.items[0].listId).toBe('list-1');
    expect(item.shoppingList.userId).toBe('user-1');
  });
});
