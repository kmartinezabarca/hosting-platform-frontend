# Component Documentation — ROKE Industries Frontend

Para una vista interactiva ejecuta: **`pnpm storybook`** (puerto 6006).

---

## Componentes UI Base (`src/components/ui/`)

Basados en **shadcn/ui** + **Radix UI**. No editar directamente — crear wrappers si necesitas variantes.

| Componente | Props clave | Storybook |
|------------|-------------|-----------|
| `Button` | `variant`, `size`, `disabled`, `asChild` | UI/Button |
| `Badge` | `variant`, `asChild` | UI/Badge |
| `Card` + subcomponentes | `className` | UI/Card |
| `Dialog` | `open`, `onOpenChange` | — |
| `Select` | `value`, `onValueChange` (z-index `z-[300]` para modales) | — |
| `Input` | HTML input attrs | — |
| `Skeleton` | `className` | — |

### Button variants
```jsx
<Button variant="default" />     // Azul principal
<Button variant="destructive" /> // Rojo — acciones irreversibles
<Button variant="outline" />     // Con borde
<Button variant="secondary" />   // Gris
<Button variant="ghost" />       // Sin fondo
<Button variant="link" />        // Solo texto subrayado
```

---

## Layout Components

### `ClientLayout`
Envuelve todas las rutas `/client/*`. Provee sidebar, navbar, y el portal del chat.

### `AdminLayout`
Envuelve todas las rutas `/admin/*`. Provee sidebar expandible con submenús (Blog, Docs).

### `ErrorBoundary`
```jsx
<ErrorBoundary fallback={<MiComponenteError />}>
  <MiApp />
</ErrorBoundary>
```
Captura cualquier error de render. Muestra UI de fallback con "Intentar de nuevo" y "Ir al inicio".
En modo dev muestra el mensaje de error.

---

## Auth Components

### `ProtectedRoute`
```jsx
<ProtectedRoute>                  // Solo clientes autenticados
<ProtectedRoute requireAdmin>     // Solo administradores
```

### `AuthGuard`
Redirige a `/login` si no hay sesión activa.

---

## Profile Components (`src/components/profile/`)

| Componente | Descripción |
|------------|-------------|
| `ProfileHeader` | Avatar (con upload), nombre, email, badge de verificación, estadísticas |
| `ProfileTabs` | Tabs: Perfil / Seguridad / Dispositivos |
| `PersonalInfoSection` | Formulario de datos personales con react-hook-form |
| `SecuritySection` | Cambio de contraseña + 2FA. Oculta contraseña si `isGoogleUser=true` |
| `DevicesSection` | Lista de sesiones activas con opción de cerrar remotamente |
| `AvatarUploader` | Modal con recorte de imagen (react-image-crop) |

```jsx
<SecuritySection
  security={securityData}
  isGoogleUser={true}        // Oculta sección de contraseña
  onPasswordUpdate={fn}
  on2FAGenerate={fn}
  on2FAEnable={fn}
  on2FADisable={fn}
  qrCode={qrCodeUrl}
  twoFactorSecret={secret}
  saving2FA={boolean}
  savingPassword={boolean}
/>
```

---

## Chat Components (`src/components/chat/`)

| Componente | Descripción |
|------------|-------------|
| `TicketChatDock` | Panel flotante de chat (portal a `document.body`) |
| `MessageList` | Lista de mensajes con scroll automático |
| `MessageBubble` | Burbuja de mensaje. `isClient = role === "client"` |
| `ChatComposer` | Input con drag & drop de archivos, preview de adjuntos |
| `Lightbox` | Visor de imágenes con navegación |
| `FilePreviews` | Thumbnails de archivos adjuntos seleccionados |

### Uso del chat
```jsx
// Contexto de ticket
const { openChat, closeChat } = useTicketChat();
openChat(ticket);

// Chat de soporte general (sala persistente)
const { messages, sendMessage, supportRoom } = useSupportChat();
```

---

## Checkout Components (`src/components/checkout/`)

Flujo de 2 pasos: **Información → Revisar y Pagar**

| Componente | Descripción |
|------------|-------------|
| `Stepper` | Indicador visual de pasos |
| `ServiceFields` | Nombre, dominio, renovación automática |
| `InvoiceFields` | RFC, régimen fiscal, uso CFDI (México) |
| `Addons` | Selección de add-ons del plan |
| `OrderSummary` | Resumen de precios con descuentos por ciclo |
| `ReviewAndPay` | Selección de método de pago + Stripe |

---

## Notificaciones

### `NotificationContext`
Escucha eventos de **Laravel Reverb** en `private-user.{uuid}` y los convierte en toasts de Sonner.

Eventos soportados: `service.purchased`, `service.ready`, `service.status.changed`,
`invoice.generated`, `invoice.status.changed`, `payment.processed`, `payment.failed`, `ticket.replied`.

```jsx
const { isReady } = useNotifications();
```

### Toast directo (Sonner)
```jsx
import { toast } from 'sonner';
toast.success('Título', { description: 'Descripción opcional' });
toast.error('Error al procesar');
toast.info('Información');
```

---

## i18n

```jsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation('common');

t('auth.login')           // "Iniciar sesión"
t('billing.discount', { percent: 20 }) // "20% de descuento"

// Cambiar idioma
i18n.changeLanguage('en');
```

Traducciones en `public/locales/{es|en}/common.json`.
