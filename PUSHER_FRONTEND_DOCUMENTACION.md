# Documentación de Integración de Pusher en el Frontend

## Descripción General

Este documento detalla la integración de Pusher en el frontend de la plataforma de hosting, utilizando React y React Query para la gestión de notificaciones en tiempo real y el chat de soporte. La implementación está diseñada para ser profesional, modular y escalable, cubriendo tanto las funcionalidades para el cliente como para el administrador.

## Tecnologías Utilizadas

- **Pusher JS**: Librería cliente para la conexión con el servidor Pusher.
- **React Query**: Para la gestión de estado asíncrono, caching y sincronización de datos.
- **Axios**: Cliente HTTP para realizar peticiones a la API de Laravel.
- **React Hooks**: Para la lógica de componentes y reutilización de estado.

## Configuración

### Variables de Entorno

Las siguientes variables de entorno deben estar configuradas en el archivo `.env` del proyecto frontend (o `.env.local` para desarrollo):

```env
VITE_PUSHER_APP_ID=2047440
VITE_PUSHER_APP_KEY=5b7e09b16908ed665ba6
VITE_PUSHER_APP_SECRET=feb2cdc72e7b381e6464
VITE_PUSHER_HOST=api-us2.pusher.com
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=us2

VITE_API_URL=http://localhost:8000/api # Asegúrate de que esta URL apunte a tu backend de Laravel
```

**Nota**: Las variables `VITE_` son necesarias para que Vite (el bundler de React) las exponga al código del cliente.

## Arquitectura de la Integración

La integración de Pusher se ha estructurado en tres capas principales:

1.  **`pusherService.js`**: Servicio centralizado para la inicialización y gestión de la conexión con Pusher.
2.  **Hooks Personalizados (React Query)**: Abstracciones para consumir las APIs de notificaciones y chat, y para escuchar eventos de Pusher.
3.  **Componentes de UI**: Donde se utilizan los hooks para mostrar y gestionar la información en la interfaz de usuario.

### 1. `src/services/pusherService.js`

Este archivo contiene la lógica para inicializar la instancia de Pusher y manejar las suscripciones a canales. Es un singleton para asegurar que solo haya una conexión activa.

**Funciones principales:**
-   `getPusherInstance()`: Retorna la instancia de Pusher, creándola si no existe.
-   `subscribeToChannel(channelName, eventName, callback)`: Suscribe a un canal y enlaza un callback a un evento específico.
-   `unsubscribeFromChannel(channelName)`: Desuscribe de un canal.
-   `disconnectPusher()`: Desconecta la instancia de Pusher.

**Consideraciones de Autenticación:**
Si utilizas canales privados en Pusher (como `private-users.{userId}` o `private-chat.{chatRoomId}`), necesitarás una ruta de autenticación en tu backend de Laravel. El `pusherService.js` incluye comentarios sobre cómo configurar `authEndpoint` y `auth.headers` para enviar el token de autenticación del usuario.

```javascript
// src/services/pusherService.js
import Pusher from 'pusher-js';

// ... (variables de entorno)

export const getPusherInstance = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      wsHost: PUSHER_HOST,
      wsPort: PUSHER_PORT,
      wssPort: PUSHER_PORT,
      forceTLS: PUSHER_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      // authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      // auth: {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      //   },
      // },
    });
  }
  return pusherInstance;
};
```

### 2. Hooks Personalizados (React Query)

Se han creado hooks específicos para cada funcionalidad (notificaciones y chat) y para cada rol (cliente y administrador). Estos hooks encapsulan la lógica de fetching de datos, mutaciones y suscripciones a eventos de Pusher, proporcionando una interfaz limpia y reactiva a los componentes de UI.

**Ubicación:** `src/hooks/`

-   **`useClientNotifications.js`**
    -   `useClientNotifications()`: Para obtener las notificaciones del usuario, marcarlas como leídas, marcarlas todas como leídas y eliminarlas. Escucha eventos de nuevas notificaciones a través de Pusher.
    -   `useUnreadNotificationCount()`: Para obtener el conteo de notificaciones no leídas.

-   **`useClientChat.js`**
    -   `useSupportChat()`: Para obtener la sala de chat de soporte del usuario, los mensajes, enviar mensajes, marcar como leídos y cerrar la sala. Escucha eventos de nuevos mensajes en la sala de chat.
    -   `useUnreadChatCount()`: Para obtener el conteo de mensajes de chat no leídos.

-   **`useAdminNotifications.js`**
    -   `useAdminNotifications()`: Para obtener las notificaciones del administrador, estadísticas, enviar notificaciones a usuarios específicos o hacer broadcast, marcar como leídas y eliminarlas. Escucha eventos de nuevas notificaciones (ej. `private-admin-notifications`).

-   **`useAdminChat.js`**
    -   `useAdminChat()`: Para obtener salas de chat activas y todas las salas, estadísticas de chat, mensajes, enviar mensajes, asignar salas a agentes, cerrar y reabrir salas. Escucha eventos de nuevos mensajes y cambios de estado en las salas de chat.

**Estructura de un Hook (Ejemplo `useClientNotifications`):**

```javascript
// src/hooks/useClientNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeToChannel } from '../services/pusherService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// ... (funciones de fetching y mutación)

export const useClientNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["clientNotifications"],
    queryFn: fetchClientNotifications,
  });

  // ... (mutaciones)

  useEffect(() => {
    const channel = subscribeToChannel(
      `private-users.${localStorage.getItem("userId")}`,
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      (notification) => {
        queryClient.invalidateQueries(["clientNotifications"]);
        queryClient.invalidateQueries(["unreadNotificationCount"]);
      }
    );

    return () => {
      // Limpieza si es necesario
    };
  }, [queryClient]);

  return {
    notifications,
    isLoading,
    error,
    // ... (funciones de mutación)
  };
};
```

### 3. Integración en Componentes de UI

Los hooks se utilizan directamente en los componentes de React para acceder a los datos y las funciones de mutación. La gestión del estado de carga, errores y la actualización de la UI se maneja automáticamente por React Query.

Se ha creado un componente de ejemplo `src/components/PusherIntegrationExample.jsx` para ilustrar cómo se pueden usar estos hooks. Este componente no está integrado en la aplicación principal, sino que sirve como una guía.

**Ejemplo de Uso en un Componente (Cliente):**

```jsx
// src/components/NotificationBell.jsx (Ejemplo)
import React from 'react';
import { useClientNotifications, useUnreadNotificationCount } from '../hooks/useClientNotifications';

const NotificationBell = () => {
  const { unreadCount } = useUnreadNotificationCount();
  const { notifications, markAsRead } = useClientNotifications();

  return (
    <div>
      <span>Notificaciones ({unreadCount})</span>
      {/* Renderizar lista de notificaciones y botones para marcar como leídas */}
    </div>
  );
};

export default NotificationBell;
```

**Ejemplo de Uso en un Componente (Administrador):**

```jsx
// src/components/AdminChatDashboard.jsx (Ejemplo)
import React from 'react';
import { useAdminChat } from '../hooks/useAdminChat';

const AdminChatDashboard = () => {
  const { activeRooms, isLoadingActiveRooms, sendAdminMessage } = useAdminChat();

  return (
    <div>
      <h2>Salas de Chat Activas</h2>
      {isLoadingActiveRooms && <p>Cargando salas...</p>}
      {/* Renderizar salas y funcionalidad para enviar mensajes */}
    </div>
  );
};

export default AdminChatDashboard;
```

## Consideraciones para Producción

1.  **Variables de Entorno**: Asegúrate de que las variables de entorno de Pusher estén correctamente configuradas en tu entorno de producción. Para aplicaciones React/Vite, esto generalmente implica configurarlas en el servidor de CI/CD o en el entorno de hosting.
2.  **Servidor de Laravel**: El backend de Laravel debe estar configurado para emitir eventos de Pusher y manejar la autenticación de canales privados.
3.  **Servidor de Websockets**: Asegúrate de que tu servidor de websockets (Pusher Channels) esté activo y accesible desde el frontend.
4.  **Seguridad**: Valida siempre los datos en el backend antes de emitir eventos o enviar mensajes. Utiliza canales privados para información sensible.
5.  **Manejo de Errores**: Implementa un manejo robusto de errores en los componentes de UI para mostrar mensajes amigables al usuario en caso de fallos en la conexión o en las APIs.
6.  **Optimización**: React Query ya proporciona optimizaciones como caching y deduplicación de peticiones. Considera el uso de `staleTime` y `cacheTime` adecuados para tus datos.

## Pruebas

Para probar la funcionalidad:

1.  Asegúrate de que el backend de Laravel esté corriendo y configurado para Pusher.
2.  Inicia el servidor de desarrollo del frontend (`pnpm run dev`).
3.  Accede a la aplicación en el navegador.
4.  Simula acciones que disparen eventos (ej. registrar un nuevo usuario para el correo de bienvenida, enviar un mensaje de chat desde el backend o desde otro cliente).
5.  Verifica que las notificaciones y los mensajes de chat se reciban en tiempo real en la interfaz de usuario.

## Soporte

Para cualquier duda o problema, consulta la documentación oficial de Pusher JS y React Query, o contacta al equipo de desarrollo.

---

**Última actualización**: Septiembre 2025
**Autor**: Sistema automatizado de Roke Industries

