# Migración de Pusher a Laravel Reverb en el Frontend

## Resumen de Cambios

Este documento detalla los ajustes realizados en el proyecto `hosting-platform-frontend` para migrar del uso de Pusher a Laravel Reverb para la comunicación en tiempo real.

## Cambios Realizados

### 1. Eliminación de Dependencias de Pusher

- **Archivo modificado**: `package.json`
  - Eliminada la dependencia `pusher-js`.

### 2. Configuración de Laravel Echo y Reverb

- **Instalación de Dependencias:**
  - Se instalaron `laravel-echo` y `pusher-js` (este último es un requisito de `laravel-echo` para el `Pusher` broadcaster, aunque se conecta a Reverb).
  ```bash
  npm install laravel-echo pusher-js --force
  ```
  (Se usó `--force` debido a conflictos de `peer dependency` con `react-day-picker` y `date-fns`, y `react` versiones. Esto debe ser revisado si causa problemas en el futuro, pero permite la instalación).

- **Archivo creado**: `src/services/echoService.js`
  - Este archivo centraliza la configuración de `Laravel Echo` para conectarse a Reverb.
  - Define la instancia de `Echo` utilizando las variables de entorno para la configuración de Reverb (`VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`).
  - Configura la autorización de canales para que apunte al endpoint de `broadcasting/auth` del backend, incluyendo el `authToken` del `localStorage`.

### 3. Actualización de Hooks para Usar Laravel Echo

Se identificaron y modificaron los siguientes hooks que utilizaban `pusherService.js` para que ahora usen la nueva instancia de `echoInstance` de `echoService.js`.

- **Archivo modificado**: `src/hooks/useAdminChat.js`
  - Se cambió la importación de `pusherService` a `echoService`.
  - Se refactorizó la lógica de suscripción para usar `echoInstance.private().listen()` en lugar de `subscribeToChannel` y `channel.bind()`.
  - Se corrigió un error de sintaxis (`async` innecesario y `try/catch` redundante) en la función de configuración de suscripciones.

- **Archivo modificado**: `src/hooks/useAdminNotifications.js`
  - Se cambió la importación de `pusherService` a `echoService`.
  - Se refactorizó la lógica de suscripción para usar `echoInstance.private().listen()`.

- **Archivo modificado**: `src/hooks/useClientNotifications.js`
  - Se cambió la importación de `pusherService` a `echoService`.
  - Se refactorizó la lógica de suscripción para usar `echoInstance.private().listen()`.

- **Archivo modificado**: `src/hooks/useSupportChat.js`
  - Se cambió la importación de `pusherService` a `echoService`.
  - Se refactorizó la lógica de suscripción para usar `echoInstance.private().listen()`.

### 4. Actualización de Variables de Entorno

- **Archivo modificado**: `.env`
  - Eliminadas todas las variables de configuración de Pusher (`VITE_PUSHER_APP_ID`, `VITE_PUSHER_APP_KEY`, etc.).
  - Añadidas las variables de configuración de Reverb, que deben coincidir con las del backend:
    - `VITE_REVERB_APP_KEY=febyeijqtsstmmab9dsc`
    - `VITE_REVERB_HOST=localhost`
    - `VITE_REVERB_PORT=8080`
    - `VITE_REVERB_SCHEME=http`

### 5. Limpieza de Archivos Obsoletos

- **Archivo modificado**: `src/services/pusherService.js`
  - El contenido de este archivo fue vaciado, ya que su funcionalidad ha sido reemplazada por `echoService.js`.

## Configuración para Producción

Para el entorno de producción, asegúrate de que las variables de entorno en tu `.env` del frontend (`VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`) apunten a la URL y puerto correctos donde tu servidor Laravel Reverb esté corriendo y sea accesible públicamente (probablemente con `https` y el puerto 443 si usas un proxy inverso).

Ejemplo de `.env` para producción:

```env
VITE_REVERB_APP_KEY=febyeijqtsstmmab9dsc
VITE_REVERB_HOST=your_backend_domain.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

## Verificación

Para verificar la correcta integración, asegúrate de que el servidor Laravel Reverb esté corriendo en el backend y luego inicia el servidor de desarrollo del frontend:

```bash
npm install
npm run dev
```

Observa la consola del navegador para ver los mensajes de `Reverb: Nueva notificación...` y verifica que las notificaciones en tiempo real funcionen correctamente en la interfaz de usuario para administradores y clientes.

