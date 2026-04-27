import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Sentry } from '@/lib/sentry';
import i18n from '@/lib/i18n';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
    // Reportar a Sentry con el stack del componente como contexto adicional
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', info.componentStack);
      scope.setTag('errorBoundary', this.props.name ?? 'root');
      Sentry.captureException(error);
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;
    if (fallback) return fallback;

    const t = (key, fallback) => {
      try { return i18n.t(key) || fallback; } catch { return fallback; }
    };

    return (
      <div role="alert" className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center" aria-hidden="true">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t('errors.generic', 'Algo salió mal')}
            </h1>
            <p className="text-muted-foreground">
              {t('errors.genericDesc', 'Ocurrió un error inesperado. Puedes intentar recargar la página.')}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  {t('errors.devHint', 'Detalle del error (solo en desarrollo)')}
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs text-muted-foreground overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              {t('errors.retry', 'Intentar de nuevo')}
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              {t('errors.goHome', 'Ir al inicio')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
