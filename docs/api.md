# API Reference — ROKE Industries Frontend

Base URL configurada via `VITE_API_URL` (ver `.env.example`).  
Todas las peticiones usan cookies `httpOnly` (Laravel Sanctum). No hay Bearer tokens en el cliente.

---

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/auth/login` | Iniciar sesión con email/password |
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/logout` | Cerrar sesión (invalida cookie) |
| `POST` | `/auth/google/callback` | Login/registro con Google OAuth |
| `POST` | `/auth/2fa/verify` | Verificar código de autenticación 2FA |
| `GET`  | `/auth/me` | Usuario autenticado actual |

### `POST /auth/login`
```json
// Request
{ "email": "user@roke.com", "password": "secret" }

// Response 200
{ "message": "Login exitoso", "user": { "id": 1, "uuid": "...", "role": "client" } }

// Response 422 — credenciales inválidas
{ "message": "Credenciales incorrectas" }

// Response con 2FA requerido
{ "two_factor_required": true }
```

---

## Perfil de Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`    | `/profile` | Datos del perfil |
| `PUT`    | `/profile` | Actualizar perfil |
| `POST`   | `/profile/avatar` | Subir avatar (multipart/form-data) |
| `GET`    | `/profile/security` | Datos de seguridad (2FA, score) |
| `PUT`    | `/profile/password` | Cambiar contraseña |
| `GET`    | `/profile/sessions` | Sesiones activas |
| `DELETE` | `/profile/sessions/{uuid}` | Cerrar sesión remota |

---

## Servicios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/services` | Lista de servicios del cliente |
| `GET`  | `/services/{uuid}` | Detalle de un servicio |
| `GET`  | `/service-plans` | Planes disponibles |
| `GET`  | `/service-plans/{id}/addons` | Add-ons de un plan |

---

## Facturas y Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/invoices` | Lista de facturas |
| `GET`  | `/invoices/{uuid}` | Detalle de factura |
| `GET`  | `/payments/methods` | Métodos de pago guardados |
| `POST` | `/payments/methods` | Agregar método de pago (Stripe) |
| `PUT`  | `/payments/methods/{id}` | Establecer método por defecto |
| `DELETE` | `/payments/methods/{id}` | Eliminar método de pago |

---

## Tickets de Soporte

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/tickets` | Lista de tickets |
| `POST` | `/tickets` | Crear ticket |
| `GET`  | `/tickets/{uuid}` | Detalle del ticket |
| `POST` | `/tickets/{uuid}/replies` | Agregar respuesta |
| `PUT`  | `/tickets/{uuid}/close` | Cerrar ticket |

---

## Chat en Tiempo Real

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`  | `/chat/support-room` | Obtener/crear sala de soporte |
| `GET`  | `/chat/{uuid}/messages` | Mensajes de una sala |
| `POST` | `/chat/{uuid}/messages` | Enviar mensaje |
| `GET`  | `/chat/unread-count` | Total de mensajes no leídos |

WebSocket via **Laravel Reverb** — canal `private-ticket.{room_uuid}`, evento `.ticket.replied`.

---

## Tipos de respuesta

```typescript
// Respuesta de un recurso
{ "data": T }

// Respuesta paginada
{
  "data": T[],
  "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 73 },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}

// Error de validación (422)
{ "message": "...", "errors": { "field": ["mensaje"] } }
```

---

## Convenciones del cliente

- Todos los servicios importan desde `@/services/apiClient`
- Los tipos están en `@/types/api.ts` y `@/types/models.ts`
- Los hooks de React Query están en `@/hooks/`
- `_skipAuthRedirect: true` en el config de una petición evita el redirect a `/login` en 401
