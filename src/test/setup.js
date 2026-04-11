import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Evitar "Not implemented: navigation" de jsdom cuando hay redirects
Object.defineProperty(window, 'location', {
  value: { ...window.location, replace: vi.fn(), assign: vi.fn(), href: 'http://localhost/', pathname: '/' },
  writable: true,
});

// Arrancar MSW antes de todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Resetear handlers entre tests para evitar contaminación
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Cerrar MSW al terminar
afterAll(() => server.close());

// Silenciar console.error en tests (errores esperados)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('act('))
    ) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
