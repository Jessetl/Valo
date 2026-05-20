import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ExchangeRateSnapshotValidator } from './exchange-rate-snapshot.validator';
import type { IExchangeRateProvider } from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ValidationException } from '../../../../shared-kernel/domain/exceptions/validation.exception';

describe('ExchangeRateSnapshotValidator', () => {
  let provider: jest.Mocked<IExchangeRateProvider>;
  let validator: ExchangeRateSnapshotValidator;

  beforeEach(() => {
    provider = {
      getCurrent: jest.fn(),
    } as never;
    validator = new ExchangeRateSnapshotValidator(provider);
  });

  function mockCurrent(rate: number): void {
    provider.getCurrent.mockResolvedValue({
      rateLocalPerUsd: rate,
      source: 'DolarAPI',
      fetchedAt: new Date(),
    });
  }

  it('acepta tasa identica a la actual', async () => {
    mockCurrent(36.5);
    await expect(validator.validate(36.5)).resolves.toBeUndefined();
  });

  it('acepta tasa dentro de ±1% (limite superior)', async () => {
    mockCurrent(100);
    await expect(validator.validate(101)).resolves.toBeUndefined();
  });

  it('acepta tasa dentro de ±1% (limite inferior)', async () => {
    mockCurrent(100);
    await expect(validator.validate(99)).resolves.toBeUndefined();
  });

  it('rechaza tasa por arriba del 1%', async () => {
    mockCurrent(100);
    await expect(validator.validate(101.01)).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it('rechaza tasa por debajo del 1%', async () => {
    mockCurrent(100);
    await expect(validator.validate(98.99)).rejects.toBeInstanceOf(
      ValidationException,
    );
  });

  it('exception incluye campo exchangeRateSnapshot con valor recibido', async () => {
    mockCurrent(100);
    await validator.validate(150).catch((err) => {
      expect(err).toBeInstanceOf(ValidationException);
      expect((err as ValidationException).fields[0].field).toBe(
        'exchangeRateSnapshot',
      );
      expect((err as ValidationException).fields[0].value).toBe(150);
    });
  });
});
