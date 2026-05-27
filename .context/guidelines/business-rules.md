# 📐 Business Rules — Kashy

> Reglas de negocio para monedas, conversiones, cálculos financieros e IVA.
> Cualquier IA o desarrollador debe consultar este archivo antes de implementar lógica de cálculos o manipulación de montos.

---

## 💱 Moneda y Tasa de Cambio

### Reglas generales

| Regla                    | Detalle                                                                                  |
| :----------------------- | :--------------------------------------------------------------------------------------- |
| **Moneda local MVP**     | Bolívar (VES).                                                                           |
| **Moneda de referencia** | Dólar estadounidense (USD).                                                              |
| **Fuente de tasa**       | DolarAPI — tasa oficial BCV (`/v1/dolares/oficial`).                                     |
| **Dual currency**        | Todo monto se almacena en moneda local **y** en USD.                                     |
| **Quién calcula**        | El frontend calcula la conversión usando la tasa actual y envía ambos montos al backend. |

> La única validación de tasa con tolerancia ±1% existe en **listas de compras** sobre `exchangeRateSnapshot` (ver sección [Exchange Rate Snapshot](#-exchange-rate-snapshot)). En registros financieros el backend **no valida** la consistencia entre `amount_local` y `amount_usd`: confía en el cálculo del frontend y persiste ambos valores tal cual.

### Escalabilidad multi-país (Post-MVP)

| Campo           | Propósito                                                       |
| :-------------- | :-------------------------------------------------------------- |
| `country_code`  | Determina la moneda local y las reglas fiscales del usuario.    |
| `currency_code` | Código ISO de la moneda local (ej: `VES`, `ARS`, `COP`, `CLP`). |

Cuando se agreguen nuevos países, la fuente de tasa de cambio se resuelve por `country_code`:

| País         | Moneda | Fuente                 |
| :----------- | :----- | :--------------------- |
| 🇻🇪 Venezuela | VES    | DolarAPI — BCV oficial |
| 🇦🇷 Argentina | ARS    | Por definir (Post-MVP) |
| 🇨🇴 Colombia  | COP    | Por definir (Post-MVP) |
| 🇨🇱 Chile     | CLP    | Por definir (Post-MVP) |

> DolarAPI ya soporta Argentina, Colombia y Chile. Se puede reutilizar como proveedor para el Post-MVP.

---

## 🧾 IVA (Impuesto al Valor Agregado)

### Reglas del MVP

| Regla                  | Detalle                                                                          |
| :--------------------- | :------------------------------------------------------------------------------- |
| **Tasa IVA Venezuela** | 16% fijo.                                                                        |
| **Aplica a**           | Listas de compras (`shopping_lists`).                                            |
| **Activación**         | Campo `iva_enabled` en la lista. Si es `true`, el IVA se calcula sobre el total. |
| **Cálculo**            | El IVA se calcula sobre la suma de los items, no por item individual.            |
| **Almacenamiento**     | El IVA no se almacena como campo — se calcula al mostrar.                        |

### Fórmulas

```
subtotal_local = Σ (unit_price_local × quantity) para cada item
iva_amount_local = subtotal_local × 0.16  (si iva_enabled = true, sino 0)
total_local = subtotal_local + iva_amount_local

subtotal_usd = Σ (unit_price_usd × quantity) para cada item
iva_amount_usd = subtotal_usd × 0.16  (si iva_enabled = true, sino 0)
total_usd = subtotal_usd + iva_amount_usd
```

### Escalabilidad multi-país (Post-MVP)

| País         | IVA |
| :----------- | :-- |
| 🇻🇪 Venezuela | 16% |
| 🇦🇷 Argentina | 21% |
| 🇨🇴 Colombia  | 19% |
| 🇨🇱 Chile     | 19% |

> Cuando se agreguen países, la tasa de IVA se resuelve por `country_code`. Considerar una tabla de configuración `tax_rates` en el Post-MVP.

---

## 📸 Exchange Rate Snapshot

### Reglas

| Regla                  | Detalle                                                                                                                                                                                               |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cuándo se captura**  | Al momento de crear la lista de compras.                                                                                                                                                              |
| **Mutabilidad**        | Híbrida según `listType`: en `TEMPLATE` el snapshot se puede re-cotizar (PATCH lo acepta); en `RECEIPT` es **inmutable** (PATCH lo rechaza con `422`).                                                |
| **Propósito**          | Garantizar que las comparaciones entre listas reflejen la tasa vigente al momento de cada compra, no la tasa actual.                                                                                  |
| **Fuente**             | Campo `promedio` del endpoint `/v1/dolares/oficial` de DolarAPI.                                                                                                                                      |
| **Validación backend** | Cuando el cliente envía `exchangeRateSnapshot` (en `POST` o en `PATCH` sobre `TEMPLATE`), el backend valida que esté dentro de ±1% respecto a la tasa actual del provider. Si excede, responde `422`. |

### ¿Por qué inmutable solo en RECEIPT?

- `TEMPLATE` = lista pre-compra (en cotización). El usuario aún ajusta items y la tasa de referencia puede refrescarse mientras la lista no se cierre.
- `RECEIPT` = lista post-compra (precios reales). La tasa del momento del pago queda congelada para que la comparadora refleje lo que el usuario realmente pagó. Si el snapshot se actualizara en `RECEIPT`, se perderían los precios históricos y las métricas serían incorrectas.

### Validación de tolerancia

El cliente obtiene la tasa actual vía `GET /api/v1/exchange-rates/current` y la envía como `exchangeRateSnapshot` al crear o actualizar la lista. El backend re-consulta su propio provider (con cache TTL) y valida:

```
current_rate = exchange_rate_provider.getCurrent().rateLocalPerUsd
tolerance = current_rate * 0.01

if abs(exchange_rate_snapshot - current_rate) > tolerance:
    return 422 "exchangeRateSnapshot fuera de tolerancia (±1%) respecto a la tasa actual"
```

Cubre desfases por cache, latencia o redondeo. Rechaza tasas manipuladas o stale.

**En `PATCH`:**

- Si `listType = TEMPLATE` y el body incluye `exchangeRateSnapshot`, el backend valida tolerancia y persiste el nuevo valor.
- Si `listType = RECEIPT` y el body incluye `exchangeRateSnapshot`, el backend responde `422` (inmutabilidad).
- Si el body omite `exchangeRateSnapshot`, se preserva el valor existente sin re-validar (aplica a ambos tipos).

---

## 💰 Registros Financieros — Cálculos

### Ingreso de montos

| Regla                     | Detalle                                                                             |
| :------------------------ | :---------------------------------------------------------------------------------- |
| **Quién elige la moneda** | El usuario elige si ingresa en VES o USD.                                           |
| **Conversión**            | El frontend calcula el monto en la otra moneda usando la tasa actual.               |
| **Almacenamiento**        | Se guardan ambos: `amount_local` y `amount_usd`.                                    |
| **Validación backend**    | El backend **no valida** la consistencia entre ambos montos. Confía en el frontend. |

### Balance mensual

```
total_income_local = Σ amount_local donde type = INCOME y date dentro del mes
total_expense_local = Σ amount_local donde type = EXPENSE y date dentro del mes
net_balance_local = total_income_local - total_expense_local

total_income_usd = Σ amount_usd donde type = INCOME y date dentro del mes
total_expense_usd = Σ amount_usd donde type = EXPENSE y date dentro del mes
net_balance_usd = total_income_usd - total_expense_usd
```

> El balance se calcula siempre sobre registros del mes consultado. Incluye registros recurrentes ya generados.

### Recurrencia

| Regla                  | Detalle                                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------------------------- |
| **Día de recurrencia** | `recurrence_day` (1-31). Si el mes tiene menos días, se usa el último día del mes.                     |
| **Generación**         | Cron job diario genera el registro del mes siguiente cuando `recurrence_day` del mes actual ha pasado. |
| **Monto**              | Se copia `amount_local` y `amount_usd` del registro original. No se recalcula con tasa actual.         |
| **Notificación**       | Se crea automáticamente una notificación 1 día antes de la fecha del nuevo registro.                   |

### Prioridad

| Valor    | Uso sugerido                                                        |
| :------- | :------------------------------------------------------------------ |
| `HIGH`   | Gastos críticos: alquiler, servicios, deudas.                       |
| `MEDIUM` | Gastos importantes pero postergables: suscripciones, seguros.       |
| `LOW`    | Gastos opcionales: entretenimiento, compras no esenciales.          |
| `null`   | Sin prioridad asignada (ingresos generalmente no tienen prioridad). |

### Tasa de interés

| Regla        | Detalle                                                                             |
| :----------- | :---------------------------------------------------------------------------------- |
| **Campo**    | `interest_rate` (Decimal, nullable).                                                |
| **Uso**      | Informativo para el usuario. Aplica a egresos tipo deuda/préstamo.                  |
| **Cálculo**  | El MVP no calcula interés compuesto ni proyecciones. Es solo un dato de referencia. |
| **Post-MVP** | La IA de plan de ahorro usará este campo para proyecciones financieras.             |

---

## 🛒 Listas de Compras — Cálculos

### Totales de una lista

```
subtotal_local = Σ (unit_price_local × quantity)
subtotal_usd = Σ (unit_price_usd × quantity)

// Solo si iva_enabled = true
iva_local = subtotal_local × 0.16
iva_usd = subtotal_usd × 0.16

total_local = subtotal_local + iva_local
total_usd = subtotal_usd + iva_usd
```

### Comparadora de listas

| Regla                          | Detalle                                                                                                                                                       |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Match de productos**         | Por `product_name` (case-insensitive, trim).                                                                                                                  |
| **Diferencia de precio**       | Se calcula tanto en moneda local como en USD.                                                                                                                 |
| **Cada lista con su snapshot** | Cada lista usa su propio `exchange_rate_snapshot`. Las comparaciones en USD son directas. Las comparaciones en local son relativas al momento de cada compra. |
| **Recomendación**              | El campo `recommended` indica cuál lista es más económica basándose en la suma de precios USD de los productos que hicieron match.                            |

---

## 📌 Reglas Transversales

| Regla                  | Detalle                                                                       |
| :--------------------- | :---------------------------------------------------------------------------- |
| **Decimales**          | Todos los montos se almacenan con 2 decimales.                                |
| **Redondeo**           | Redondeo estándar (half-up): 0.005 → 0.01.                                    |
| **Montos negativos**   | No permitidos. Todos los montos son >= 0.                                     |
| **Moneda por defecto** | Si el usuario no especifica `currency_code`, se infiere de su `country_code`. |
| **Zona horaria**       | Todas las fechas en UTC. El frontend convierte a la zona horaria del usuario. |
