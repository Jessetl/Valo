import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IShoppingListRepository } from '../../domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../domain/entities/shopping-list.entity';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { CreateShoppingListUseCase } from './create-shopping-list.use-case';
import { ExchangeRateSnapshotValidator } from '../services/exchange-rate-snapshot.validator';
import { ValidationException } from '../../../../shared-kernel/domain/exceptions/validation.exception';

describe('CreateShoppingListUseCase', () => {
  let repo: jest.Mocked<IShoppingListRepository>;
  let validator: jest.Mocked<ExchangeRateSnapshotValidator>;
  let useCase: CreateShoppingListUseCase;

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
    useCase = new CreateShoppingListUseCase(repo, validator);

    repo.save.mockImplementation(async (l: ShoppingList) => l);
  });

  it('valida exchangeRateSnapshot contra provider antes de crear', async () => {
    await useCase.execute({
      userId: 'u1',
      dto: {
        name: 'Test',
        listType: ShoppingListType.TEMPLATE,
        countryCode: 'VE',
        currencyCode: 'VES',
        exchangeRateSnapshot: 36.5,
      } as never,
    });

    expect(validator.validate).toHaveBeenCalledWith(36.5);
  });

  it('propaga ValidationException si tasa fuera de tolerancia y no persiste', async () => {
    validator.validate.mockRejectedValueOnce(
      new ValidationException('out of tolerance'),
    );

    await expect(
      useCase.execute({
        userId: 'u1',
        dto: {
          name: 'Test',
          listType: ShoppingListType.TEMPLATE,
          countryCode: 'VE',
          currencyCode: 'VES',
          exchangeRateSnapshot: 50,
        } as never,
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(repo.save).not.toHaveBeenCalled();
  });

  it('asigna userId del token (no del dto)', async () => {
    await useCase.execute({
      userId: 'token-user',
      dto: {
        name: 'Test',
        listType: ShoppingListType.TEMPLATE,
        countryCode: 'VE',
        currencyCode: 'VES',
        exchangeRateSnapshot: 36.5,
      } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.userId).toBe('token-user');
  });

  it('crea lista sin items cuando dto.items vacio', async () => {
    await useCase.execute({
      userId: 'u1',
      dto: {
        name: 'Test',
        listType: ShoppingListType.TEMPLATE,
        countryCode: 'VE',
        currencyCode: 'VES',
        exchangeRateSnapshot: 36.5,
      } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.items).toHaveLength(0);
  });

  it('crea items con cantidad y precio sin almacenar totales', async () => {
    await useCase.execute({
      userId: 'u1',
      dto: {
        name: 'Test',
        listType: ShoppingListType.TEMPLATE,
        countryCode: 'VE',
        currencyCode: 'VES',
        exchangeRateSnapshot: 36.5,
        items: [
          { productName: 'A', category: 'C', unitPriceLocal: 10, quantity: 2 },
          { productName: 'B', category: 'C', unitPriceLocal: 5, quantity: 1 },
        ],
      } as never,
    });

    const saved = repo.save.mock.calls[0][0];
    expect(saved.items).toHaveLength(2);
    expect(saved.items[0].unitPriceLocal).toBe(10);
    expect(saved.items[0].quantity).toBe(2);
  });
});
