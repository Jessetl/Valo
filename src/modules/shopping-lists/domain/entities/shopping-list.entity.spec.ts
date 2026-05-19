import { describe, expect, it } from '@jest/globals';
import { ShoppingItem } from './shopping-item.entity';
import { ShoppingList } from './shopping-list.entity';
import { ShoppingListType } from '../enums/shopping-list-type.enum';

function makeItem(productName: string, price: number): ShoppingItem {
  return ShoppingItem.create(
    'item-' + productName,
    'list-1',
    productName,
    'Cat',
    price,
    1,
    null,
    36.5,
    false,
  );
}

describe('ShoppingList domain entity', () => {
  it('crea lista con campos obligatorios del spec', () => {
    const item = makeItem('Pan', 10);

    const list = ShoppingList.create({
      id: 'l1',
      userId: 'u1',
      name: 'Lista test',
      listType: ShoppingListType.TEMPLATE,
      countryCode: 'VE',
      currencyCode: 'VES',
      exchangeRateSnapshot: 36.5,
      items: [item],
    });

    expect(list.id).toBe('l1');
    expect(list.listType).toBe(ShoppingListType.TEMPLATE);
    expect(list.countryCode).toBe('VE');
    expect(list.currencyCode).toBe('VES');
    expect(list.exchangeRateSnapshot).toBe(36.5);
    expect(list.isActive).toBe(true);
    expect(list.items).toHaveLength(1);
  });

  it('aplica defaults: storeName=null, ivaEnabled=false, scheduledDate=null, lat/lng=null', () => {
    const list = ShoppingList.create({
      id: 'l1',
      userId: 'u1',
      name: 'Lista',
      listType: ShoppingListType.RECEIPT,
      countryCode: 'VE',
      currencyCode: 'VES',
      exchangeRateSnapshot: 36.5,
    });

    expect(list.storeName).toBeNull();
    expect(list.ivaEnabled).toBe(false);
    expect(list.scheduledDate).toBeNull();
    expect(list.latitude).toBeNull();
    expect(list.longitude).toBeNull();
    expect(list.items).toEqual([]);
  });

  it('reconstitute construye desde props completos', () => {
    const list = ShoppingList.reconstitute('l1', {
      userId: 'u1',
      name: 'Lista',
      storeName: 'Super',
      listType: ShoppingListType.RECEIPT,
      countryCode: 'VE',
      currencyCode: 'USD',
      exchangeRateSnapshot: 36.5,
      ivaEnabled: true,
      scheduledDate: new Date('2026-04-01T00:00:00Z'),
      latitude: 10.5,
      longitude: -66.9,
      isActive: false,
      items: [],
    });

    expect(list.storeName).toBe('Super');
    expect(list.isActive).toBe(false);
    expect(list.ivaEnabled).toBe(true);
  });
});
