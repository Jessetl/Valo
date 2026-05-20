import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { IExchangeRateProvider } from '../../../../shared-kernel/domain/interfaces/exchange-rate-provider.interface';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import type { DolarApiResponse } from '../../domain/types/dolar-api-response.type';
import { getCurrencyConfig } from '../../domain/config/country-currency.config';
import { ExternalServiceException } from '../../../../shared-kernel/domain/exceptions/external-service.exception';

const FETCH_TIMEOUT_MS = 10_000;
const CACHE_KEY = 'exchange-rate:current:VES';
const DEFAULT_TTL_SECONDS = 600;

interface CachedExchangeRate {
  id: string;
  rateLocalPerUsd: number;
  source: string;
  fetchedAt: string;
}

@Injectable()
export class DolarApiExchangeRateProvider implements IExchangeRateProvider {
  private readonly logger = new Logger(DolarApiExchangeRateProvider.name);

  /**
   * Fallback de ultimo recurso: ultima tasa exitosa en memoria del proceso.
   * Solo se usa si cache esta vacio (TTL expirado o flush) Y DolarAPI falla.
   * Regla irrompible: la app nunca muestra "tasa no disponible".
   */
  private lastKnownRate: ExchangeRate | null = null;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getCurrent(): Promise<ExchangeRate> {
    const cached = await this.cache.get<CachedExchangeRate>(CACHE_KEY);
    if (cached) {
      return this.hydrate(cached);
    }

    const config = getCurrencyConfig();
    try {
      const rate = await this.fetchFromApi(config.apiUrl, config.rateField);
      this.lastKnownRate = rate;
      await this.cache.set(CACHE_KEY, this.serialize(rate), this.ttlMs());
      return rate;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch exchange rate: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (this.lastKnownRate) {
        this.logger.warn('Using last known rate as fallback');
        return this.lastKnownRate;
      }
      throw new ExternalServiceException(
        'DolarAPI',
        'No se pudo obtener la tasa de cambio actual',
      );
    }
  }

  private async fetchFromApi(
    url: string,
    rateField: 'promedio' | 'venta' | 'compra',
  ): Promise<ExchangeRate> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as DolarApiResponse;
      const rate = data[rateField] ?? data.promedio;

      if (!rate || rate <= 0) {
        throw new Error(`Invalid rate value: ${String(rate)}`);
      }

      return ExchangeRate.create(randomUUID(), rate, data.fuente ?? 'DolarAPI');
    } finally {
      clearTimeout(timeout);
    }
  }

  private ttlMs(): number {
    const raw = process.env.DOLARAPI_CACHE_TTL;
    const seconds = raw ? Number(raw) : DEFAULT_TTL_SECONDS;
    const safe =
      Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_TTL_SECONDS;
    return safe * 1000;
  }

  private serialize(rate: ExchangeRate): CachedExchangeRate {
    return {
      id: rate.id,
      rateLocalPerUsd: rate.rateLocalPerUsd,
      source: rate.source,
      fetchedAt: rate.fetchedAt.toISOString(),
    };
  }

  private hydrate(cached: CachedExchangeRate): ExchangeRate {
    return ExchangeRate.reconstitute(cached.id, {
      rateLocalPerUsd: cached.rateLocalPerUsd,
      source: cached.source,
      fetchedAt: new Date(cached.fetchedAt),
    });
  }
}
