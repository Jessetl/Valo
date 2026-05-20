# 🔔 Notifications — `/api/v1/notifications`

> Listado, lectura y eliminación de notificaciones del usuario, y gestión de preferencias de notificación.
> Las notificaciones se crean automáticamente desde el módulo de finanzas — no hay endpoint de creación manual.
> Todas las operaciones son exclusivas del rol KASHY (autenticado).

---

## Resumen de Endpoints

| Emoji | Método   | Ruta                          | Auth | Descripción                                     |
| :---: | -------- | ----------------------------- | :--: | ----------------------------------------------- |
|  🟡   | `POST`   | `/notifications/search`       |  ✅  | Listar notificaciones con filtros y paginación. |
|  🟢   | `GET`    | `/notifications/unread-count` |  ✅  | Contador de notificaciones no leídas (badge).   |
|  🟠   | `PATCH`  | `/notifications/:id/read`     |  ✅  | Marcar una notificación como leída.             |
|  🟡   | `POST`   | `/notifications/read-all`     |  ✅  | Marcar todas las notificaciones como leídas.    |
|  🔴   | `DELETE` | `/notifications/:id`          |  ✅  | Eliminar una notificación.                      |
|  🟢   | `GET`    | `/notifications/preferences`  |  ✅  | Obtener preferencias de notificación.           |
|  🟠   | `PATCH`  | `/notifications/preferences`  |  ✅  | Actualizar preferencias de notificación.        |

> **Nota:** Todas las rutas llevan el prefijo `/api/v1`. Los headers `Authorization`, `X-Device-Id` y `X-Device-Name` son obligatorios en todos los endpoints.

---

## Endpoints

### 🟡 `POST /notifications/search`

> Lista las notificaciones del usuario con filtros y paginación.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "page": 1,
  "limit": 20,
  "filters": {
    "is_read": "boolean | null",
    "status": "PENDING | SENT | FAILED | null",
    "type": "string | null",
    "scheduled_date_from": "date | null",
    "scheduled_date_to": "date | null"
  }
}
```

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "string",
      "scheduled_at": "2026-06-14",
      "sent_at": "2026-06-14 | null",
      "status": "SENT",
      "is_read": false,
      "financial_record": {
        "id": "uuid",
        "title": "string",
        "type": "EXPENSE",
        "amount_local": 0.0,
        "amount_usd": 0.0,
        "date": "2026-06-15"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "total_pages": 2
  }
}
```

> Cada notificación incluye un resumen del registro financiero asociado para que el frontend pueda mostrar contexto sin hacer una segunda llamada.

**Errores posibles:** `400`, `401`

---

### 🟢 `GET /notifications/unread-count`

> Devuelve el número de notificaciones no leídas. Usado por el Dashboard para el badge del icono de notificaciones.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `200 OK`:**

```json
{
  "unread_count": 5
}
```

**Errores posibles:** `401`

---

### 🟠 `PATCH /notifications/:id/read`

> Marca una notificación específica como leída.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `200 OK`:**

```json
{
  "id": "uuid",
  "type": "string",
  "scheduled_at": "2026-06-14",
  "sent_at": "2026-06-14 | null",
  "status": "SENT",
  "is_read": true,
  "financial_record": {
    "id": "uuid",
    "title": "string",
    "type": "EXPENSE",
    "amount_local": 0.0,
    "amount_usd": 0.0,
    "date": "2026-06-15"
  }
}
```

> Devuelve la notificación actualizada con `is_read: true`.

**Errores posibles:** `400`, `401`, `404`

---

### 🟡 `POST /notifications/read-all`

> Marca todas las notificaciones no leídas del usuario como leídas.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:** _(vacío)_

**Response `200 OK`:**

```json
{
  "marked_count": 5
}
```

> Devuelve la cantidad de notificaciones que fueron marcadas como leídas en esta operación.

**Errores posibles:** `401`

---

### 🔴 `DELETE /notifications/:id`

> Elimina una notificación.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `204 No Content`**

_(Sin body — el HTTP status confirma la eliminación.)_

> Eliminar una notificación no afecta al registro financiero asociado.

**Errores posibles:** `400`, `401`, `404`

---

### 🟢 `GET /notifications/preferences`

> Obtiene las preferencias de notificación del usuario autenticado.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `200 OK`:**

```json
{
  "push_enabled": true,
  "debt_reminders": true,
  "price_alerts": false,
  "list_reminders": true
}
```

> Si el usuario no tiene preferencias creadas, el backend devuelve los valores por defecto (todos en `true`).

**Errores posibles:** `401`

---

### 🟠 `PATCH /notifications/preferences`

> Actualiza las preferencias de notificación del usuario. Solo se envían los campos a modificar.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "push_enabled": "boolean | null",
  "debt_reminders": "boolean | null",
  "price_alerts": "boolean | null",
  "list_reminders": "boolean | null"
}
```

**Response `200 OK`:**

```json
{
  "push_enabled": true,
  "debt_reminders": true,
  "price_alerts": true,
  "list_reminders": false
}
```

> Devuelve el DTO canónico actualizado de las preferencias. Si el usuario no tenía registro de preferencias, se crea automáticamente con los valores enviados y defaults para el resto.

**Errores posibles:** `400`, `401`, `422`
