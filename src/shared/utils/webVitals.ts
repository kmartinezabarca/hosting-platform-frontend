/**
 * Web Vitals — monitoreo de métricas de rendimiento del navegador.
 *
 * Métricas capturadas:
 *   LCP  — Largest Contentful Paint  (percepción de carga)
 *   INP  — Interaction to Next Paint  (responsividad)
 *   CLS  — Cumulative Layout Shift    (estabilidad visual)
 *   FCP  — First Contentful Paint     (primera pintura con contenido)
 *   TTFB — Time to First Byte         (latencia de red/servidor)
 *
 * En producción se reportan a Sentry como custom measurements.
 * En desarrollo se imprimen en consola como tabla para depuración rápida.
 */

import type { Metric } from 'web-vitals';
import * as Sentry from '@sentry/react';

// Umbrales de "bueno" según Google Core Web Vitals (ms / score)
const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP:  { good: 2500, poor: 4000 },
  INP:  { good: 200,  poor: 500  },
  CLS:  { good: 0.1,  poor: 0.25 },
  FCP:  { good: 1800, poor: 3000 },
  TTFB: { good: 800,  poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

function handleMetric(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);

  if (import.meta.env.DEV) {
    const icon = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `%c[WebVitals] ${icon} ${metric.name}`,
      `color: ${rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red'}; font-weight:bold`,
      `${metric.value.toFixed(2)} ${metric.name === 'CLS' ? '' : 'ms'} — ${rating}`,
    );
    return;
  }

  // Producción → Sentry custom measurement + breadcrumb
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value.toFixed(2)}`,
      level: rating === 'poor' ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating,
        id: metric.id,
        navigationType: metric.navigationType,
      },
    });

    // Reportar como transacción de Sentry para performance dashboard
    (Sentry.getCurrentScope() as any).setMeasurement(metric.name, metric.value, 'millisecond');

    // Si es una métrica "poor", capturar como evento de Sentry para alertas
    if (rating === 'poor') {
      Sentry.captureMessage(`Poor Web Vital: ${metric.name} = ${metric.value.toFixed(0)}`, {
        level: 'warning',
        tags: { 'web-vital': metric.name, 'web-vital-rating': rating },
        extra: { value: metric.value, threshold: THRESHOLDS[metric.name]?.poor },
      });
    }
  }
}

/**
 * Inicializa la recolección de Web Vitals.
 * Llamar una sola vez desde main.tsx después de montar la app.
 */
export async function initWebVitals(): Promise<void> {
  try {
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  } catch {
    // web-vitals no está disponible en entornos sin soporte (tests, SSR, etc.)
    if (import.meta.env.DEV) {
      console.warn('[WebVitals] No se pudo inicializar web-vitals.');
    }
  }
}
