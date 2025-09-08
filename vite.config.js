import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['.manus.computer']
  }
})



// Add Echo configuration to global window object
// This is needed for Laravel Echo to work correctly
// with Vite and the browser environment.
// Make sure these match your .env variables
// VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT, VITE_REVERB_SCHEME

// This is a workaround for the fact that Vite doesn't expose process.env
// directly in the browser. We need to manually expose these variables
// to the window object so Laravel Echo can pick them up.

// This should be done in a more robust way for production, e.g.,
// by passing these variables from the backend to the frontend.

// For now, this will work for development and testing.

// IMPORTANT: Ensure these match your .env variables
// VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT, VITE_REVERB_SCHEME

// window.LaravelEcho = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT,
//     wssPort: import.meta.env.VITE_REVERB_PORT,
//     forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
//     enabledTransports: ['ws', 'wss'],
// });


