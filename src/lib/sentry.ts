import * as Sentry from '@sentry/react';

/**
 * Inicializa Sentry para monitoreo de errores en producción.
 * Solo se activa si VITE_SENTRY_DSN está definido y no estamos en dev.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION ?? 'unknown',

    // Porcentaje de sesiones con performance tracing (0.1 = 10% en prod)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Reproducción de sesiones solo en producción (1% de errores)
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.01 : 0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],

    // No capturar errores locales de red (common en dev)
    ignoreErrors: [
      'Network Error',
      'Request aborted',
      'ResizeObserver loop limit exceeded',
    ],

    beforeSend(event) {
      // Omitir eventos de usuarios anónimos en desarrollo
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}

/**
 * Identifica al usuario autenticado en Sentry para mejor contexto en errores.
 */
export function setSentryUser(user: { id: number; uuid: string; email: string; role: string } | null): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  if (user) {
    Sentry.setUser({ id: String(user.id), email: user.email, role: user.role });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
