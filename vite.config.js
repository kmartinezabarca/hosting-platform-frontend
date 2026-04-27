import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  const isAdmin   = mode === 'admin' || mode === 'admin-staging';
  const env       = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';
  const isProd    = mode === 'production' || mode === 'admin';

  return {
    plugins: [
      react(),
      tailwindcss(),
      isProd && env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
        org:        env.SENTRY_ORG,
        project:    env.SENTRY_PROJECT,
        authToken:  env.SENTRY_AUTH_TOKEN,
        sourcemaps: { assets: './dist/**' },
        release:    { name: env.VITE_APP_VERSION ?? 'unknown' },
      }),
      isAnalyze && visualizer({
        filename: 'dist/stats.html',
        open:       true,
        gzipSize:   true,
        brotliSize: true,
        template:   'treemap',
      }),
    ].filter(Boolean),

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    server: {
      host:       true,
      port:       Number(env.VITE_DEV_PORT) || 5173,
      strictPort: true,
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
    },

    build: {
      outDir:    isAdmin ? 'dist-admin' : 'dist-portal',
      sourcemap: isProd ? 'hidden' : true,
      rollupOptions: {
        input: isAdmin
          ? path.resolve(__dirname, 'index-admin.html')
          : path.resolve(__dirname, 'index.html'),
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query:  ['@tanstack/react-query'],
            ui:     ['framer-motion', 'lucide-react', 'sonner'],
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
      globals:     true,
      environment: 'jsdom',
      environmentOptions: { jsdom: { url: 'http://localhost' } },
      include:     ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude:     ['e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles:  ['./src/test/setup.js'],
      css:         false,
      coverage: {
        reporter: ['text', 'html'],
        exclude:  ['src/test/**', 'src/components/ui/**', 'src/stories/**'],
      },
    },
  };
});