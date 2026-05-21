import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingItem } from '../../domain/entities/shopping-item.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { ShoppingListNotFoundException } from '../../domain/exceptions/shopping-list-not-found.exception';
import { UpdateShoppingListUseCase } from './update-shopping-list.use-case';
import { ExchangeRateSnapshotValidator } from '../services/exchange-rate-snapshot.validator';
import { ValidationException } from '../../../../shared-kernel/domain/exceptions/validation.exception';

function makeList(
  overrides: { items?: ShoppingItem[]; listType?: ShoppingListType } = {},
): ShoppingList {
  return ShoppingList.create({
    id: 'l1',
    userId: 'u1',
    name: 'Lista',
    listType: overrides.listType ?? ShoppingListType.TEMPLATE,
    countryCode: 'VE',
    currencyCode: 'VES',
    exchangeRateSnapshot: 36.5,
    items: overrides.items,
  });
}

describe('UpdateShoppingListUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let validator: jest.Mocked<ExchangeRateSnapshotValidator>;
  let useCase: UpdateShoppingListUseCase;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findByIdsAndUserId: jest.fn(),
      searchByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as never;
    validator = {
      validate: jest.fn(),
    } as never;
    validator.validate.mockResolvedValue(undefined);
    useCase = new UpdateShoppingListUseCase(repo, validator);

    repo.save.mockImplementation(async (l: ShoppingList) => l);
  });

  it('NO valida tasa si dto omite exchangeRateSnapshot', async () => {
    repo.findByIdAndUserId.mockResolvedValue(makeList());

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: { name: 'Nueva' } as never,
    });

    expect(validator.validate).not.toHaveBeenCalled();
  });

  it('valida tasa si dto envia exchangeRateSnapshot', async () => {
    repo.findByIdAndUserId.mockResolvedValue(makeList());

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: { exchangeRateSnapshot: 37 } as never,
    });

    expect(validator.validate).toHaveBeenCalledWith(37);
  });

  it('propaga ValidationException si tasa fuera de tolerancia y no persiste', async () => {
    repo.findByIdAndUserId.mockResolvedValue(makeList());
    validator.validate.mockRejectedValueOnce(
      new ValidationException('out of tolerance'),
    );

    await expect(
      useCase.execute({
        listId: 'l1',
        userId: 'u1',
        dto: { exchangeRateSnapshot: 100 } as never,
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rechaza update de snapshot en RECEIPT (inmutable) y no valida tasa', async () => {
    repo.findByIdAndUserId.mockResolvedValue(
      makeList({ listType: ShoppingListType.RECEIPT }),
    );

    await expect(
      useCase.execute({
        listId: 'l1',
        userId: 'u1',
        dto: { exchangeRateSnapshot: 37 } as never,
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(validator.validate).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('permite update sin snapshot en RECEIPT (preserva tasa existente)', async () => {
    repo.findByIdAndUserId.mockResolvedValue(
      makeList({ listType: ShoppingListType.RECEIPT }),
    );

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: { name: 'Nombre nuevo' } as never,
    });

    expect(validator.validate).not.toHaveBeenCalled();
    const saved = repo.save.mock.calls[0][0];
    expect(saved.exchangeRateSnapshot).toBe(36.5);
  });

  it('throws cuando lista no existe O pertenece a otro user', async () => {
    repo.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        listId: 'l1',
        userId: 'u-attacker',
        dto: { name: 'Hack' } as never,
      }),
    ).rejects.toBeInstanceOf(ShoppingListNotFoundException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('preserva userId original — no permite mass assignment desde dto', async () => {
    repo.findByIdAndUserId.mockResolvedValue(makeList());

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: { name: 'Nueva' } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.userId).toBe('u1');
  });

  it('replace de items: items sin id se crean, items con id se preservan, faltantes se borran', async () => {
    const existingItem = ShoppingItem.create(
      'item-existing',
      'l1',
      'Existing',
      'Cat',
      10,
      1,
      null,
      36.5,
      false,
    );
    repo.findByIdAndUserId.mockResolvedValue(
      makeList({ items: [existingItem] }),
    );

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: {
        items: [
          // item con id existente → preserva id
          {
            id: 'item-existing',
            productName: 'Existing-Renamed',
            category: 'Cat',
            unitPriceLocal: 20,
          },
          // item nuevo sin id → genera nuevo
          {
            productName: 'New',
            category: 'Cat',
            unitPriceLocal: 5,
          },
        ],
      } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.items).toHaveLength(2);
    expect(saved.items[0].id).toBe('item-existing');
    expect(saved.items[0].productName).toBe('Existing-Renamed');
    expect(saved.items[1].id).not.toBe('item-existing');
  });

  it('replace items: backend reemplaza coleccion completa', async () => {
    repo.findByIdAndUserId.mockResolvedValue(makeList());

    await useCase.execute({
      listId: 'l1',
      userId: 'u1',
      dto: {
        items: [
          { productName: 'A', category: 'C', unitPriceLocal: 10, quantity: 3 },
        ],
      } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.items).toHaveLength(1);
    expect(saved.items[0].unitPriceLocal).toBe(10);
    expect(saved.items[0].quantity).toBe(3);
  });
});
