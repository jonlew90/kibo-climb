import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0-mvp'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      'react-onesignal': 'react-onesignal',
      '@onesignal/capacitor-plugin': '@onesignal/capacitor-plugin'
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon.svg', 'favicon.png', 'OneSignalSDKWorker.js', 'push/onesignal/OneSignalSDKWorker.js', 'geo/*.json'],
      manifest: false, // Use existing site.webmanifest
      workbox: {
        inlineWorkboxRuntime: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
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
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/analytics'],
          icons: ['lucide-react'],
          maps: ['react-simple-maps', 'd3-geo'],
          qr: ['html5-qrcode', 'qrcode.react'],
          stripe: ['@stripe/stripe-js']
        }
      }
    }
  }
});

