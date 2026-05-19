import { ShoppingItem } from '../../domain/entities/shopping-item.entity';

const IVA_RATE = 0.16;

export interface ListTotals {
  subtotalLocal: number;
  subtotalUsd: number | null;
  ivaLocal: number;
  ivaUsd: number | null;
  totalLocal: number;
  totalUsd: number | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calcula totales segun business-rules.md:
 * - subtotal = Σ (unit_price × quantity) sobre TODOS los items (sin filtrar is_checked).
 * - iva = subtotal × 0.16 si iva_enabled, sino 0.
 * - total = subtotal + iva.
 *
 * USD: si algun item tiene unitPriceUsd null, los totales USD = null
 * (no se puede calcular con datos parciales).
 */
export function computeListTotals(
  items: ShoppingItem[],
  ivaEnabled: boolean,
): ListTotals {
  const subtotalLocal = round2(
    items.reduce(
      (sum, item) => sum + (item.unitPriceLocal ?? 0) * item.quantity,
      0,
    ),
  );

  const anyUsdMissing = items.some((item) => item.unitPriceUsd === null);
  const subtotalUsd = anyUsdMissing
    ? null
    : round2(
        items.reduce(
          (sum, item) => sum + (item.unitPriceUsd ?? 0) * item.quantity,
          0,
        ),
      );

  const ivaLocal = ivaEnabled ? round2(subtotalLocal * IVA_RATE) : 0;
  const ivaUsd =
    subtotalUsd === null
      ? null
      : ivaEnabled
        ? round2(subtotalUsd * IVA_RATE)
        : 0;

  const totalLocal = round2(subtotalLocal + ivaLocal);
  const totalUsd = subtotalUsd === null ? null : round2(subtotalUsd + ivaUsd!);

  return {
    subtotalLocal,
    subtotalUsd,
    ivaLocal,
    ivaUsd,
    totalLocal,
    totalUsd,
  };
}
