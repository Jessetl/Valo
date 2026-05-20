import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import {
  EXCHANGE_RATE_PROVIDER,
  type IExchangeRateProvider,
} from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ExchangeRateResponseDto } from '../dtos/exchange-rate-response.dto';
import { ExchangeRateMapper } from '../mappers/exchange-rate.mapper';
import { getCurrencyConfig } from '../../domain/config/country-currency.config';

@Injectable()
export class GetCurrentExchangeRateUseCase
  implements UseCase<void, ExchangeRateResponseDto>
{
  constructor(
    @Inject(EXCHANGE_RATE_PROVIDER)
    private readonly exchangeRateProvider: IExchangeRateProvider,
  ) {}

  async execute(): Promise<ExchangeRateResponseDto> {
    const config = getCurrencyConfig();
    const rate = await this.exchangeRateProvider.getCurrent();
    return ExchangeRateMapper.toResponse(rate, config.currency);
  }
}
