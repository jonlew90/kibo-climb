import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Automatically fallback to next available port if 5173 is occupied
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
