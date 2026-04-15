import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),

      // Sentry: sube source maps en producción si hay auth token
      isProd && env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: { assets: './dist/**' },
        release: { name: env.VITE_APP_VERSION ?? 'unknown' },
      }),

      // Bundle analyzer: genera stats.html al hacer `pnpm analyze`
      isAnalyze && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT) || 5173,
      strictPort: true,
      // Agregar hosts permitidos en VITE_ALLOWED_HOSTS (separados por coma)
      // allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',') ?? [],
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
    },

    build: {
      // Source maps en producción para Sentry (no expuestos al usuario)
      sourcemap: isProd ? 'hidden' : true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:  ['react', 'react-dom', 'react-router-dom'],
            query:   ['@tanstack/react-query'],
            ui:      ['framer-motion', 'lucide-react', 'sonner'],
            radix: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-dropdown-menu',
            ],
          },
        },
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      environmentOptions: {
        jsdom: { url: 'http://localhost' },
      },
      // Incluir solo tests unitarios — excluir E2E de Playwright
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles: ['./src/test/setup.js'],
      css: false,
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['src/test/**', 'src/components/ui/**', 'src/stories/**'],
      },
    },
  };
});
