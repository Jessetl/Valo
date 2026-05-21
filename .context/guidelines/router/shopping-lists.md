# 🛒 Shopping Lists — `/api/v1/shopping-lists`

> CRUD de listas de compras con items en batch, comparadora de métricas entre listas y soporte multi-moneda.
> Todas las operaciones son exclusivas del rol KASHY (autenticado). El guest opera solo en local (AsyncStorage).

---

## Resumen de Endpoints

| Emoji | Método   | Ruta                      | Auth | Descripción                                      |
| :---: | -------- | ------------------------- | :--: | ------------------------------------------------ |
|  🟡   | `POST`   | `/shopping-lists`         |  ✅  | Crear lista con todos sus items.                 |
|  🟡   | `POST`   | `/shopping-lists/search`  |  ✅  | Listar listas con filtros y paginación.          |
|  🟢   | `GET`    | `/shopping-lists/:id`     |  ✅  | Obtener detalle de una lista con sus items.      |
|  🟠   | `PATCH`  | `/shopping-lists/:id`     |  ✅  | Actualizar lista y sincronizar items por upsert. |
|  🔴   | `DELETE` | `/shopping-lists/:id`     |  ✅  | Eliminar una lista y todos sus items.            |
|  🟡   | `POST`   | `/shopping-lists/compare` |  ✅  | Comparar productos entre 2 listas.               |

> **Nota:** Todas las rutas llevan el prefijo `/api/v1`. Los headers `Authorization`, `X-Device-Id` y `X-Device-Name` son obligatorios en todos los endpoints.

> **Convención de nombrado:** Request y response usan **camelCase** en los keys JSON (`storeName`, `unitPriceLocal`, `subtotalLocal`, etc.). Los valores enum permanecen en `UPPER_SNAKE_CASE` (`TEMPLATE`, `RECEIPT`) y los discriminantes de comparación en `snake_case` (`list_a`, `list_b`, `equal`).

---

## Endpoints

### 🟡 `POST /shopping-lists`

> Crea una lista de compras con todos sus items en una sola transacción.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "name": "string",
  "storeName": "string | null",
  "listType": "TEMPLATE | RECEIPT",
  "countryCode": "string",
  "currencyCode": "string",
  "exchangeRateSnapshot": 0.0,
  "ivaEnabled": false,
  "scheduledDate": "timestamp | null",
  "latitude": 0.0,
  "longitude": 0.0,
  "items": [
    {
      "productName": "string",
      "category": "string",
      "quantity": 1,
      "unitPriceLocal": 0.0,
      "unitPriceUsd": 0.0,
      "isChecked": false
    }
  ]
}
```

**Response `201 Created`:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "storeName": "string | null",
  "listType": "TEMPLATE",
  "countryCode": "string",
  "currencyCode": "string",
  "exchangeRateSnapshot": 0.0,
  "ivaEnabled": false,
  "scheduledDate": "timestamp | null",
  "latitude": 0.0,
  "longitude": 0.0,
  "isActive": true,
  "subtotalLocal": 0.0,
  "subtotalUsd": 0.0,
  "ivaLocal": 0.0,
  "ivaUsd": 0.0,
  "totalLocal": 0.0,
  "totalUsd": 0.0,
  "items": [
    {
      "id": "uuid",
      "listId": "uuid",
      "productName": "string",
      "category": "string",
      "quantity": 1,
      "unitPriceLocal": 0.0,
      "unitPriceUsd": 0.0,
      "isChecked": false
    }
  ]
}
```

> La lista y todos sus items se crean en una sola transacción. Si falla un item, no se crea nada.

> **Totales calculados en backend** (per `business-rules.md` — listas):
>
> - `subtotalLocal = Σ (unitPriceLocal × quantity)` sobre todos los items.
> - `subtotalUsd = Σ (unitPriceUsd × quantity)`. `null` si algún item carece de `unitPriceUsd`.
> - `ivaLocal = subtotalLocal × 0.16` si `ivaEnabled`, sino `0`.
> - `ivaUsd = subtotalUsd × 0.16` si `ivaEnabled`, sino `0`. `null` si `subtotalUsd` es `null`.
> - `totalLocal = subtotalLocal + ivaLocal`.
> - `totalUsd = subtotalUsd + ivaUsd`. `null` si `subtotalUsd` es `null`.
>
> El cliente no recalcula: usa los totales del backend para evitar drift.

> **Validación de `exchangeRateSnapshot`:** el backend re-consulta la tasa actual del provider y valida que el valor recibido esté dentro de ±1% (per `business-rules.md` — Exchange Rate Snapshot). Si excede, responde `422` con detalle del campo. Si el provider externo no responde, se usa la última tasa conocida en cache/fallback.

**Errores posibles:** `400`, `401`, `422`

---

### 🟡 `POST /shopping-lists/search`

> Lista las listas de compras del usuario con filtros y paginación.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "page": 1,
  "limit": 20,
  "filters": {
    "listType": "TEMPLATE | RECEIPT | null",
    "storeName": "string | null",
    "isActive": "boolean | null",
    "scheduledDateFrom": "timestamp | null",
    "scheduledDateTo": "timestamp | null"
  }
}
```

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "storeName": "string | null",
      "listType": "TEMPLATE",
      "currencyCode": "string",
      "isActive": true,
      "scheduledDate": "timestamp | null",
      "itemsCount": 12,
      "checkedCount": 5,
      "totalLocal": 0.0,
      "totalUsd": 0.0
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

> El listado devuelve un resumen de cada lista con conteo de items, marcados y totales computados. No incluye el detalle de items para mantener el payload liviano.

> **Totales del summary** (per `business-rules.md`):
>
> - `totalLocal = subtotalLocal + ivaLocal` sobre todos los items.
> - `totalUsd = subtotalUsd + ivaUsd`. `null` si algún item carece de `unitPriceUsd`.
>
> El cálculo es idéntico al del detalle (`GET /shopping-lists/:id`).

**Errores posibles:** `400`, `401`

---

### 🟢 `GET /shopping-lists/:id`

> Obtiene el detalle completo de una lista con todos sus items y los totales computados.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `200 OK`:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "storeName": "string | null",
  "listType": "TEMPLATE",
  "countryCode": "string",
  "currencyCode": "string",
  "exchangeRateSnapshot": 0.0,
  "ivaEnabled": false,
  "scheduledDate": "timestamp | null",
  "latitude": 0.0,
  "longitude": 0.0,
  "isActive": true,
  "subtotalLocal": 0.0,
  "subtotalUsd": 0.0,
  "ivaLocal": 0.0,
  "ivaUsd": 0.0,
  "totalLocal": 0.0,
  "totalUsd": 0.0,
  "items": [
    {
      "id": "uuid",
      "listId": "uuid",
      "productName": "string",
      "category": "string",
      "quantity": 1,
      "unitPriceLocal": 0.0,
      "unitPriceUsd": 0.0,
      "isChecked": false
    }
  ]
}
```

> **Totales calculados en backend** — mismo shape y reglas que `POST /shopping-lists`. `subtotalUsd`, `ivaUsd` y `totalUsd` son `null` si algún item carece de `unitPriceUsd`.

**Errores posibles:** `401`, `404`

---

### 🟠 `PATCH /shopping-lists/:id`

> Actualiza los datos de la lista y sincroniza sus items mediante upsert por `id`. El array de items enviado representa el estado final deseado: los items con `id` existente se actualizan, los items sin `id` se crean con un nuevo UUID, y los items existentes no incluidos en el array se eliminan. Toda la operación ocurre en una sola transacción.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "name": "string | null",
  "storeName": "string | null",
  "listType": "TEMPLATE | RECEIPT | null",
  "currencyCode": "string | null",
  "exchangeRateSnapshot": "number | null",
  "ivaEnabled": "boolean | null",
  "scheduledDate": "timestamp | null",
  "latitude": "number | null",
  "longitude": "number | null",
  "isActive": "boolean | null",
  "items": [
    {
      "id": "uuid | null",
      "productName": "string",
      "category": "string",
      "quantity": 1,
      "unitPriceLocal": 0.0,
      "unitPriceUsd": 0.0,
      "isChecked": false
    }
  ]
}
```

> **Sobre `items`:** si el campo `items` se omite del body, los items existentes se conservan sin cambios. Si se envía (aunque sea `[]`), se aplica la sincronización completa descrita abajo.

**Response `200 OK`:**

> Devuelve el DTO canónico completo de la lista con los items actualizados (mismo shape que `GET /shopping-lists/:id`).

**Flujo interno:**

1. Actualiza los campos de la lista que vengan en el body (los omitidos conservan su valor previo).
2. Si `items` viene en el body, sincroniza el conjunto de `shopping_items`:
   - Item con `id` que pertenece a la lista → se actualizan sus campos.
   - Item sin `id` (o con `id` desconocido) → se crea con un nuevo UUID.
   - Item existente cuyo `id` no aparece en el array → se elimina.
3. Todo en una sola transacción — si falla cualquier paso, rollback completo.

> **Por qué upsert en vez de delete + insert:** preservar los `id` de items existentes permite que el cliente mantenga su estado local (selecciones, scroll, sync optimista) sin necesidad de re-mapear referencias después de cada PATCH. También evita romper relaciones futuras que apunten al `id` del item.

> **Validación de `exchangeRateSnapshot` (mutabilidad híbrida):**
>
> - Si `listType = TEMPLATE` y el body incluye `exchangeRateSnapshot`, el backend valida que esté dentro de ±1% respecto a la tasa actual del provider (per `business-rules.md`) y persiste el nuevo valor.
> - Si `listType = RECEIPT` y el body incluye `exchangeRateSnapshot`, el backend responde `422` (snapshot inmutable post-compra).
> - Si el body omite `exchangeRateSnapshot`, se preserva el valor existente sin re-validar (aplica a ambos tipos).

**Errores posibles:** `400`, `401`, `404`, `422`

---

### 🔴 `DELETE /shopping-lists/:id`

> Elimina una lista y todos sus items asociados.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `204 No Content`**

_(Sin body — el HTTP status confirma la eliminación.)_

**Flujo interno:**

1. Elimina todos los `shopping_items` de la lista.
2. Elimina la `shopping_list`.
3. Transacción única.

**Errores posibles:** `401`, `404`

---

### 🟡 `POST /shopping-lists/compare`

> Compara los productos entre 2 listas. Cruza por nombre de producto: los que hacen match muestran la diferencia de precio, los que no coinciden se muestran separados por lista de origen.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "listAId": "uuid",
  "listBId": "uuid"
}
```

**Response `200 OK`:**

```json
{
  "listA": {
    "id": "uuid",
    "name": "string",
    "storeName": "string | null"
  },
  "listB": {
    "id": "uuid",
    "name": "string",
    "storeName": "string | null"
  },
  "matchedItems": [
    {
      "productName": "string",
      "category": "string",
      "listAPriceLocal": 0.0,
      "listAPriceUsd": 0.0,
      "listAQuantity": 1,
      "listBPriceLocal": 0.0,
      "listBPriceUsd": 0.0,
      "listBQuantity": 1,
      "priceDiffLocal": 0.0,
      "priceDiffUsd": 0.0,
      "cheaperIn": "list_a | list_b | equal"
    }
  ],
  "unmatchedItems": {
    "onlyInListA": [
      {
        "productName": "string",
        "category": "string",
        "quantity": 1,
        "unitPriceLocal": 0.0,
        "unitPriceUsd": 0.0
      }
    ],
    "onlyInListB": [
      {
        "productName": "string",
        "category": "string",
        "quantity": 1,
        "unitPriceLocal": 0.0,
        "unitPriceUsd": 0.0
      }
    ]
  },
  "summary": {
    "totalMatched": 8,
    "totalUnmatchedA": 2,
    "totalUnmatchedB": 3,
    "listATotalLocal": 0.0,
    "listBTotalLocal": 0.0,
    "savingsLocal": 0.0,
    "savingsUsd": 0.0,
    "recommended": "list_a | list_b | equal"
  }
}
```

> **Lógica de match:** se cruzan productos por `productName` (case-insensitive, trim). Si un producto aparece en ambas listas, entra en `matchedItems` con la diferencia de precio. Si solo aparece en una, va a `unmatchedItems` bajo su lista de origen. El `summary` muestra totales y cuál lista es más económica en los productos que hacen match.

> **Valores de discriminación:** `cheaperIn` y `recommended` retornan `'list_a'`, `'list_b'` o `'equal'` (snake_case como discriminantes, no como keys). Esto preserva un identificador estable independiente del nombre de la lista.

**Errores posibles:** `400`, `401`, `404`
