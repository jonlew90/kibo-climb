import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

function prependOneSignalSwPlugin() {
  return {
    name: 'prepend-onesignal-sw',
    enforce: 'post',
    closeBundle: {
      sequential: true,
      order: 'post',
      handler() {
        const swPath = path.resolve('dist/sw.js');
        if (fs.existsSync(swPath)) {
          let content = fs.readFileSync(swPath, 'utf8');
          const importStmt = 'importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");\n';
          content = content.replace(/importScripts\(["'][^"']+OneSignalSDK[^"']*["']\);?/g, '');
          fs.writeFileSync(swPath, importStmt + content);
        }
      }
    }
  };
}

export default defineConfig({
  define: {
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
    prependOneSignalSwPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon.svg', 'favicon.png', 'OneSignalSDKWorker.js', 'geo/*.json'],
      manifest: false, // Use existing site.webmanifest
      workbox: {
        inlineWorkboxRuntime: true,
        importScripts: ['https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'],
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

