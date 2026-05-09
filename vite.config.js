import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => {
  const isAdmin   = mode === 'admin' || mode === 'admin-staging';
  const env       = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';
  const isProd    = mode === 'production' || mode === 'admin';

  return {
    plugins: [
      react(),
      tailwindcss(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          useFlatConfig: true,
        },
      }),
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
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@core': path.resolve(__dirname, './src/core'),
    '@application': path.resolve(__dirname, './src/application'),
    '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
    '@presentation': path.resolve(__dirname, './src/presentation'),
    '@shared': path.resolve(__dirname, './src/shared'),
  },
},

    server: {
      host:       true,
      port:       Number(env.VITE_DEV_PORT) || 5173,
      strictPort: true,
      hmr: {
        host: '5173-idfi9x9veas4sl1ixpqa9-f9be0046.us1.manus.computer',
        protocol: 'wss',
      },
      // Agrega el host permitido para evitar el error de "Blocked request"
      // Esto es necesario cuando se accede a través de un proxy o un dominio diferente.
      // Asegúrate de que este valor coincida con el dominio que estás utilizando.
      // Por ejemplo, si estás usando un túnel ngrok, sería algo como 'your-ngrok-domain.ngrok.io'
      // En este caso, estamos usando el dominio proporcionado por Manus.
      // Para producción, se recomienda configurar esto de forma más robusta.
      // Ver: https://vitejs.dev/config/server-options.html#server-allowedhosts
      // Ver: https://vitejs.dev/config/server-options.html#server-hmr
      allowedHosts: [
        '5173-idfi9x9veas4sl1ixpqa9-f9be0046.us1.manus.computer'
      ],
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