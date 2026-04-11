import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT) || 5173,
      strictPort: true,
      // allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',') ?? [],
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
    },

    build: {
      sourcemap: mode !== 'production',
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
      setupFiles: ['./src/test/setup.js'],
      css: false,
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['src/test/**', 'src/components/ui/**'],
      },
    },
  }
})
