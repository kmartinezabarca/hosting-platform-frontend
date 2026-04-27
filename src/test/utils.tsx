import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Crea un QueryClient sin reintentos (ideal para tests — falla rápido).
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Wrapper mínimo para renderizar componentes que usan React Query.
 */
export function renderWithQuery(
  ui: React.ReactElement,
  { queryClient }: { queryClient?: QueryClient } = {},
) {
  const qc = queryClient ?? createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { ...render(ui, { wrapper: Wrapper }), queryClient: qc };
}

/**
 * Wrapper para hooks que usan React Query.
 * Uso:  renderHook(() => useMyHook(), { wrapper: queryWrapper() })
 */
export function queryWrapper(queryClient?: QueryClient) {
  const qc = queryClient ?? createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return Wrapper;
}
