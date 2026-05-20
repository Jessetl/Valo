import { Inject, Injectable } from '@nestjs/common';
import {
  EXCHANGE_RATE_PROVIDER,
  IExchangeRateProvider,
} from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ValidationException } from '../../../../shared-kernel/domain/exceptions/validation.exception';

const TOLERANCE_PCT = 0.01;

@Injectable()
export class ExchangeRateSnapshotValidator {
  constructor(
    @Inject(EXCHANGE_RATE_PROVIDER)
    private readonly exchangeRateProvider: IExchangeRateProvider,
  ) {}

  async validate(exchangeRateSnapshot: number): Promise<void> {
    const current = await this.exchangeRateProvider.getCurrent();
    const tolerance = current.rateLocalPerUsd * TOLERANCE_PCT;
    const drift = Math.abs(exchangeRateSnapshot - current.rateLocalPerUsd);

    if (drift > tolerance) {
      throw new ValidationException(
        'exchangeRateSnapshot fuera de tolerancia (±1%) respecto a la tasa actual.',
        [
          {
            field: 'exchangeRateSnapshot',
            value: exchangeRateSnapshot,
            error: `Debe estar dentro de ±${TOLERANCE_PCT * 100}% de ${current.rateLocalPerUsd}.`,
          },
        ],
      );
    }
  }
}
