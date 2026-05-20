# 🔐 Auth — `/api/v1/auth`

> Autenticación, gestión de contraseña, perfil y sesión del usuario.
> Firebase es un detalle de implementación del backend — el frontend nunca interactúa directamente con Firebase.

---

## Flujo de Autenticación

```
Frontend                         Backend                          Firebase
   |                                |                                |
   |-- POST /auth/login ----------->|                                |
   |   (email + password)           |-- signInWithPassword --------->|
   |                                |<-- idToken + refreshToken -----|
   |                                |                                |
   |                                | 1. Valida idToken              |
   |                                | 2. Guarda refreshToken         |
   |                                |    encriptado en user_devices  |
   |                                | 3. Genera JWT custom (15 min)  |
   |                                |                                |
   |<-- JWT custom + user ----------|                                |
   |                                |                                |
   | (15 min después, JWT expira)   |                                |
   |                                |                                |
   |-- POST /auth/refresh --------> |                                |
   |   (X-Device-Id, Authorization  |-- Busca refreshToken del       |
   |   en header)                   |   dispositivo en user_devices  |
   |                                |-- Token exchange ------------->|
   |                                |<-- Nuevo idToken --------------|
   |                                |                                |
   |                                | 1. Genera nuevo JWT custom     |
   |                                |                                |
   |<-- Nuevo JWT custom -----------|                                |
```

### Reglas de seguridad

- El `refreshToken` de Firebase **nunca** sale del backend. Se almacena encriptado en `user_devices`.
- El JWT custom tiene vida corta (15 min). El frontend lo almacena en memoria o AsyncStorage.
- El refresh es transparente: el frontend detecta un `401` y llama a `/auth/refresh` automáticamente.
- Al hacer logout, el backend elimina el `refreshToken` y el registro del dispositivo.

---

## Resumen de Endpoints

| Emoji | Método  | Ruta                     | Auth | Descripción                                         |
| :---: | ------- | ------------------------ | :--: | --------------------------------------------------- |
|  🟡   | `POST`  | `/auth/register`         |  ❌  | Registro con email y contraseña.                    |
|  🟡   | `POST`  | `/auth/login`            |  ❌  | Login con email y contraseña.                       |
|  🟡   | `POST`  | `/auth/login/google`     |  ❌  | Login con token de Google/Firebase.                 |
|  🟡   | `POST`  | `/auth/refresh`          |  ⚠️  | Renovación de JWT. Requiere JWT expirado como proof-of-possession + `X-Device-Id`. |
|  🟡   | `POST`  | `/auth/recover-password` |  ❌  | Envío de email de recuperación.                     |
|  🟡   | `POST`  | `/auth/change-password`  |  ✅  | Cambio de contraseña.                               |
|  🟢   | `GET`   | `/auth/profile`          |  ✅  | Obtener perfil del usuario.                         |
|  🟠   | `PATCH` | `/auth/profile`          |  ✅  | Actualizar datos del perfil.                        |
|  🟡   | `POST`  | `/auth/logout`           |  ✅  | Cerrar sesión y eliminar device token.              |

> **Nota:** Todas las rutas llevan el prefijo `/api/v1`. Los headers `X-Device-Id` y `X-Device-Name` son obligatorios en todos los endpoints de auth (excepto `recover-password`). Los endpoints con Auth ✅ requieren además `Authorization: Bearer {jwt}`.

---

## Endpoints

### 🟡 `POST /auth/register`

> Registro de nuevo usuario. El backend crea la cuenta en Firebase Auth, persiste el usuario en BD, emite el evento `USER_REGISTERED` (notifications crea las preferencias por defecto) y dispara un correo de verificación de Firebase. **No emite JWT** — el usuario debe verificar el email y luego iniciar sesión via `POST /auth/login`.

**Auth:** ❌ Pública
**Headers:** Ninguno requerido (no requiere `X-Device-Id` / `X-Device-Name` porque no abre sesión).

**Request Body:**

```json
{
  "email": "string",
  "password": "string (min 8, max 64)",
  "first_name": "string (max 80)",
  "last_name": "string (max 80)",
  "country_code": "string (ISO 3166-1 alpha-2, len 2)",
  "latitude": "number | null",
  "longitude": "number | null"
}
```

> **Campos requeridos:** `email`, `password`, `first_name`, `last_name`, `country_code`.
> **Campos opcionales:** `latitude`, `longitude` (se persisten en `users` si vienen).

**Response `201 Created`:**

```json
{
  "message": "Usuario registrado. Revisa tu correo para verificar la cuenta antes de iniciar sesion.",
  "email": "string"
}
```

**Flujo interno:**

1. Backend valida que `email` no exista en BD.
2. Llama a Firebase REST API `signUp` con `email`, `password` y `displayName = "{first_name} {last_name}"`.
3. Persiste el usuario en `users` con los datos recibidos + `firebase_uid` de Firebase + `subscription_plan = FREE`.
4. Si la persistencia falla, hace rollback eliminando el usuario en Firebase.
5. Emite evento `USER_REGISTERED` — notifications crea fila default en `notification_preferences`.
6. Llama a Firebase `sendOobCode` (`VERIFY_EMAIL`) con el `idToken` para enviar el correo de verificación.
7. Si el envío del correo falla, el endpoint igual responde `201` (verify se puede re-disparar al intentar login).

> **Por qué no emite JWT:** se exige verificación de email antes de poder iniciar sesión (`POST /auth/login` valida `emailVerified` y lanza `403 EmailNotVerified` si no lo está). Esto impide que cuentas no verificadas obtengan sesión activa. El refresh token de Firebase **no se almacena en este endpoint** — se almacena al primer login exitoso.

**Errores posibles:** `400` (datos inválidos), `409` (`UserAlreadyExists`), `422`

---

### 🟡 `POST /auth/login`

> Login con email y contraseña. El backend autentica contra Firebase, almacena/actualiza el refresh token y devuelve un JWT custom.

**Auth:** ❌ Pública
**Headers:** `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200 OK`:**

```json
{
  "access_token": "string (JWT custom, 15 min)",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "string",
    "first_name": "string | null",
    "last_name": "string | null",
    "avatar_url": "string | null",
    "subscription_plan": "string",
    "country_code": "string",
    "latitude": "number | null",
    "longitude": "number | null"
  }
}
```

**Flujo interno:**

1. Backend llama a Firebase REST API `signInWithPassword`.
2. Firebase devuelve `idToken` + `refreshToken`.
3. Backend valida el `idToken`, busca/crea el usuario en BD.
4. Guarda `refreshToken` encriptado en `user_devices` (upsert por `X-Device-Id`).
5. Genera JWT custom con `userId`, `email`, `role` y expira en 15 min.
6. Devuelve el JWT custom + datos del usuario.

> **`country_code` por defecto:** El flujo normal asume que el usuario ya existe en BD (persistido por `POST /auth/register`, que valida `country_code` del body). Si el usuario existe en Firebase pero **no** en BD (caso orphan: BD perdida, migración, registro fuera de banda), `login` auto-crea la fila con `country_code = 'VE'` como fallback. El usuario debe actualizarlo vía `PATCH /auth/profile`. No se infiere de IP ni de headers — Venezuela es el mercado primario del MVP.

**Errores posibles:** `400`, `401`

---

### 🟡 `POST /auth/login/google`

> Login con token de Google vía Firebase. Mismo flujo que login manual pero el frontend envía el `idToken` de Google.

**Auth:** ❌ Pública
**Headers:** `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "google_id_token": "string"
}
```

**Response `200 OK`:**

```json
{
  "access_token": "string (JWT custom, 15 min)",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "string",
    "first_name": "string | null",
    "last_name": "string | null",
    "avatar_url": "string | null",
    "subscription_plan": "string",
    "country_code": "string",
    "latitude": "number | null",
    "longitude": "number | null"
  }
}
```

**Flujo interno:**

1. Backend verifica el `google_id_token` con Firebase Admin SDK.
2. Si el usuario no existe, lo crea en BD (auto-registro).
3. Obtiene `refreshToken` de Firebase vía token exchange.
4. Guarda `refreshToken` encriptado en `user_devices`.
5. Genera JWT custom y devuelve.

> **`country_code` por defecto:** El flujo Google no recibe `country_code` en el body (sólo `google_id_token`). En auto-registro, el backend persiste el usuario con `country_code = 'VE'` (mercado primario del MVP). El usuario puede actualizarlo vía `PATCH /auth/profile`. No se infiere de IP, locale del idToken ni headers.

**Errores posibles:** `400`, `401`

---

### 🟡 `POST /auth/refresh`

> Renueva el JWT custom. El backend usa el refresh token almacenado en BD para obtener un nuevo idToken de Firebase y genera un nuevo JWT.

**Auth:** ⚠️ Bearer token **obligatorio** como proof-of-possession (acepta JWT expirado — la firma se valida ignorando expiración).
**Headers:**

- `Authorization: Bearer {jwt}` — JWT actual o expirado del cliente. **Obligatorio**. Si falta, responde `401 Unauthorized`.
- `X-Device-Id` — Obligatorio. Debe corresponder al dispositivo dueño del refresh token.
- `X-Device-Name` — Opcional en esta ruta.

**Request Body:** _(vacío)_

**Response `200 OK`:**

```json
{
  "access_token": "string (nuevo JWT custom, 15 min)",
  "expires_in": 900
}
```

**Flujo interno:**

1. Backend extrae el JWT del header `Authorization: Bearer`. Si está ausente, responde `401`.
2. Verifica la firma del JWT con `ignoreExpiration: true` para obtener el `sub` (`userId`). Si la firma es inválida, responde `401`.
3. Busca el dispositivo en `user_devices` por `X-Device-Id`. Si no existe, responde `401`.
4. Verifica que `user_devices.user_id` coincida con `jwt.sub` (proof-of-possession). Si no coincide, responde `401` y registra warning.
5. Desencripta el `firebase_refresh_token` del dispositivo. Si la desencripción falla, responde `401`.
6. Llama a Firebase REST API `token` endpoint con el refresh token.
7. Firebase devuelve un nuevo `idToken` (y opcionalmente un nuevo `refreshToken`). Si Firebase rechaza el refresh, responde `401`.
8. Si Firebase devuelve un nuevo `refreshToken` distinto al actual, lo encripta y actualiza en `user_devices`.
9. Genera nuevo JWT custom y devuelve.

**Errores posibles:** `400`, `401`

> **Importante:** Si Firebase revoca el refresh token (por cambio de contraseña, deshabilitación de cuenta, etc.) o si el `X-Device-Id` no pertenece al usuario del JWT, este endpoint devuelve `401` y el frontend debe redirigir al login.

> **Por qué el Bearer es obligatorio:** Sin proof-of-possession, cualquiera con acceso a un `X-Device-Id` podría rotar refresh tokens ajenos. El JWT expirado prueba que el cliente fue dueño de la sesión.

---

### 🟡 `POST /auth/recover-password`

> Envía email de recuperación de contraseña vía Firebase.

**Auth:** ❌ Pública
**Headers:** Ninguno requerido

**Request Body:**

```json
{
  "email": "string"
}
```

**Response `204 No Content`**

_(Sin body — el HTTP status confirma el envío.)_

> **Siempre responde `204`**, incluso si el email no existe, está mal formado o Firebase rechaza el request. Anti-enumeración: el backend traga errores transitorios y los registra como warning. La única forma de fallo visible es `400` por validación de schema (`@IsEmail` ausente o tipo inválido) antes de entrar al use case.

**Errores posibles:** `204` (éxito o fallo silenciado), `400` (body no es JSON válido o falta `email`).

---

### 🟡 `POST /auth/change-password`

> Cambio de contraseña del usuario autenticado. Revoca todos los refresh tokens del usuario en Firebase, forzando re-login en otros dispositivos.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Response `204 No Content`**

_(Sin body — el HTTP status confirma el cambio.)_

**Flujo interno:**

1. Backend verifica `current_password` contra Firebase.
2. Actualiza la contraseña en Firebase.
3. Revoca refresh tokens de Firebase (`revokeRefreshTokens`).
4. Elimina todos los `firebase_refresh_token` de `user_devices` del usuario excepto el dispositivo actual.
5. Genera nuevo refresh token para el dispositivo actual.

**Errores posibles:** `400`, `401`, `422`

---

### 🟢 `GET /auth/profile`

> Obtiene los datos del perfil del usuario autenticado.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `200 OK`:**

```json
{
  "id": "uuid",
  "email": "string",
  "first_name": "string | null",
  "last_name": "string | null",
  "avatar_url": "string | null",
  "subscription_plan": "string",
  "country_code": "string",
  "latitude": "number | null",
  "longitude": "number | null"
}
```

**Errores posibles:** `401`, `404`

---

### 🟠 `PATCH /auth/profile`

> Actualización parcial de datos del perfil.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Request Body:**

```json
{
  "first_name": "string | null",
  "last_name": "string | null",
  "avatar_url": "string | null",
  "country_code": "string | null",
  "latitude": "number | null",
  "longitude": "number | null"
}
```

**Response `200 OK`:**

```json
{
  "id": "uuid",
  "email": "string",
  "first_name": "string | null",
  "last_name": "string | null",
  "avatar_url": "string | null",
  "subscription_plan": "string",
  "country_code": "string",
  "latitude": "number | null",
  "longitude": "number | null"
}
```

> Regla: la mutación devuelve el DTO canónico actualizado.

**Errores posibles:** `400`, `401`, `422`

---

### 🟡 `POST /auth/logout`

> Cierra sesión del dispositivo actual. Elimina el refresh token y el registro del dispositivo.

**Auth:** ✅ Bearer token
**Headers:** `Authorization`, `X-Device-Id`, `X-Device-Name`

**Response `204 No Content`**

_(Sin body — el HTTP status confirma el cierre de sesión.)_

**Flujo interno:**

1. Backend busca `user_devices` por `user_id` + `X-Device-Id`.
2. Elimina el registro (refresh token encriptado + FCM token).
3. **No** se llama a Firebase. El backend ya no posee el refresh token, así que no puede renovar sesión para ese device.

> **Por qué no se revoca en Firebase:** Firebase Admin SDK sólo expone `revokeRefreshTokens(uid)`, que invalida **todos** los refresh tokens del usuario (user-wide, sin filtro per-device). Llamarlo en logout cerraría también la sesión de otros devices activos — efecto colateral no deseado. Eliminar la fila de `user_devices` basta: el backend pierde la capacidad de renovar JWT para ese device. Riesgo residual: si un atacante exfiltró el refresh token de Firebase **antes** del logout, puede usarlo directamente contra `securetoken.googleapis.com` hasta que (a) Firebase lo expire, o (b) el usuario cambie contraseña (`change-password` sí llama `revokeRefreshTokens` para forzar re-login global). Aceptado para MVP.

**Errores posibles:** `401`, `404`
