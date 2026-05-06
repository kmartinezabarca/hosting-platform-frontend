import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface SectionErrorBoundaryProps {
  /** Tag de Sentry para identificar qué sección falló (ej. "dashboard-stats") */
  name?: string;
  children: React.ReactNode;
  /** Mensaje de error personalizado; si se omite usa el texto por defecto */
  fallbackMsg?: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary granular para secciones de página.
 * Muestra una tarjeta de error compacta en línea en lugar de un takeover de pantalla completa.
 * Al fallar, el sidebar y la navegación siguen funcionando con normalidad.
 */
class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', info.componentStack);
      scope.setTag('errorBoundary', this.props.name ?? 'section');
      Sentry.captureException(error);
    });
    if (import.meta.env.DEV) {
      console.error(`[SectionErrorBoundary:${this.props.name ?? 'section'}]`, error);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const msg = this.props.fallbackMsg ?? 'No se pudo cargar esta sección.';

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center gap-3 text-center"
      >
        <div
          className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">{msg}</p>
        <button
          onClick={this.handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive/80 hover:text-destructive underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 rounded"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    );
  }
}

export default SectionErrorBoundary;
