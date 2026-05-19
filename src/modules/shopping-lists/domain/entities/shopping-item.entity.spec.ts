import { describe, expect, it } from '@jest/globals';
import { ShoppingItem } from './shopping-item.entity';

describe('ShoppingItem', () => {
  it('create calcula USD cuando no se envia unitPriceUsd y hay tasa valida', () => {
    const item = ShoppingItem.create(
      'item-1',
      'list-1',
      'Harina',
      'Comida',
      40,
      2,
      null,
      20,
    );

    expect(item.id).toBe('item-1');
    expect(item.quantity).toBe(2);
    expect(item.unitPriceLocal).toBe(40);
    expect(item.unitPriceUsd).toBe(2);
    expect(item.isChecked).toBe(false);
  });

  it('create mantiene unitPriceUsd nulo si no hay tasa valida', () => {
    const item = ShoppingItem.create(
      'item-2',
      'list-1',
      'Arroz',
      'Comida',
      25,
      3,
      null,
      0,
    );

    expect(item.unitPriceUsd).toBeNull();
  });

  it('create mantiene unitPriceUsd nulo si la tasa es null', () => {
    const item = ShoppingItem.create(
      'item-2b',
      'list-1',
      'Azucar',
      'Comida',
      12,
      2,
      null,
      null,
    );

    expect(item.unitPriceUsd).toBeNull();
  });

  it('togglePurchased invierte el estado de compra', () => {
    const original = ShoppingItem.create(
      'item-3',
      'list-1',
      'Cafe',
      'Bebidas',
      10,
      1,
      1,
      null,
      false,
    );

    const toggled = original.togglePurchased();

    expect(toggled.isChecked).toBe(true);
    expect(toggled.id).toBe(original.id);
    expect(toggled.productName).toBe(original.productName);
  });

  it('update aplica nuevos valores y respeta defaults de conversion', () => {
    const original = ShoppingItem.create(
      'item-4',
      'list-1',
      'Pasta',
      'Comida',
      12,
      1,
      null,
      24,
      false,
    );

    const updated = original.update(
      'Pasta Integral',
      'Comida',
      30,
      2,
      null,
      15,
      true,
    );

    expect(updated.id).toBe(original.id);
    expect(updated.productName).toBe('Pasta Integral');
    expect(updated.unitPriceUsd).toBe(2);
    expect(updated.quantity).toBe(2);
    expect(updated.isChecked).toBe(true);
  });

  it('reconstitute conserva props sin recalculo', () => {
    const item = ShoppingItem.reconstitute('item-5', {
      listId: 'list-1',
      productName: 'Leche',
      category: 'Lacteos',
      quantity: 2,
      unitPriceLocal: 50,
      unitPriceUsd: null,
      isChecked: true,
    });

    expect(item.unitPriceLocal).toBe(50);
    expect(item.isChecked).toBe(true);
  });

  it('acepta unitPriceLocal null (campo nullable per spec)', () => {
    const item = ShoppingItem.create(
      'item-6',
      'list-1',
      'Sin precio',
      'Otros',
      null,
      1,
      null,
      36.5,
      false,
    );

    expect(item.unitPriceLocal).toBeNull();
    expect(item.unitPriceUsd).toBeNull();
  });
});
