/**
 * Config de moneda local. MVP soporta solo Venezuela.
 *
 * URL configurable vía env `DOLARAPI_BASE_URL`. Default: ve.dolarapi.com.
 *
 * `rateField` indica el campo del JSON de DolarAPI a usar como tasa.
 */

export interface CurrencyConfig {
  country: string;
  currency: string;
  currencyName: string;
  apiUrl: string;
  rateField: 'promedio' | 'venta' | 'compra';
}

const DEFAULT_BASE_URL = 'https://ve.dolarapi.com';
const OFFICIAL_PATH = '/v1/dolares/oficial';

export function getCurrencyConfig(): CurrencyConfig {
  const baseUrl = process.env.DOLARAPI_BASE_URL ?? DEFAULT_BASE_URL;
  return {
    country: 'VE',
    currency: 'VES',
    currencyName: 'Bolívar venezolano',
    apiUrl: `${baseUrl}${OFFICIAL_PATH}`,
    rateField: 'promedio',
  };
}
