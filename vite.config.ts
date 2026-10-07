import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function devParkingApiPlugin(): Plugin {
  const GATEWAY_HEARTBEAT_TIMEOUT_MS = 4000;
  let latestParkingState = {
    slots: [
      { id: 1, name: 'LOT 1', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
      { id: 2, name: 'LOT 2', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
      { id: 3, name: 'LOT 3', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
    ],
    gate: 'OPEN',
    gateAngle: 0,
    buzzerOn: false,
    totalOccupied: 0,
    totalSlots: 3,
    lastUpdated: 0,
    isHardwareConnected: false,
    isOnline: false,
    source: 'initial',
  };

  return {
    name: 'dev-parking-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/parking/state', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data && data.slots) {
                const isDisconnected = data.isHardwareConnected === false || data.source === 'disconnected';
                const isConnected = !isDisconnected;
                latestParkingState = {
                  ...data,
                  isHardwareConnected: isConnected,
                  isOnline: isConnected,
                  totalOccupied: isConnected ? (data.totalOccupied || 0) : 0,
                  lastUpdated: isConnected ? Date.now() : 0,
                  source: isConnected ? (data.source || 'gateway_bt') : 'disconnected',
                };
                res.statusCode = 200;
                res.end(JSON.stringify({ ok: true, lastUpdated: latestParkingState.lastUpdated, isHardwareConnected: isConnected }));
                return;
              }
            } catch (e) {}
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid state' }));
          });
          return;
        }

        if (req.method === 'GET') {
          const now = Date.now();
          const timeSinceLastUpdate = now - (latestParkingState.lastUpdated || 0);

          if (
            !latestParkingState.lastUpdated ||
            timeSinceLastUpdate > GATEWAY_HEARTBEAT_TIMEOUT_MS ||
            latestParkingState.isHardwareConnected === false ||
            latestParkingState.source === 'disconnected'
          ) {
            const offlineState = {
              slots: [
                { id: 1, name: 'LOT 1', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
                { id: 2, name: 'LOT 2', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
                { id: 3, name: 'LOT 3', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString(), hasHardwareReading: false },
              ],
              gate: 'OPEN',
              gateAngle: 0,
              buzzerOn: false,
              totalOccupied: 0,
              totalSlots: 3,
              lastUpdated: 0,
              timeSinceLastUpdate: 999999,
              isHardwareConnected: false,
              isOnline: false,
              source: 'disconnected',
              statusMessage: 'Bluetooth disconnected from main phone',
            };
            res.statusCode = 200;
            res.end(JSON.stringify(offlineState));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ ...latestParkingState, isHardwareConnected: true, isOnline: true, timeSinceLastUpdate }));
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      devParkingApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.png',
          'favicon.png',
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Smart Parking - શ્રી સરકારી માધ્યમિક શાળા લાખાપર',
          short_name: 'SmartPark',
          description:
            'Automated 3-Bay Smart Parking System with Arduino Uno, MG995 Gate Servo, and 100% offline capability.',
          theme_color: '#0f172a',
          background_color: '#080c14',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'any',
          start_url: '/',
          scope: '/',
          categories: ['education', 'utilities', 'productivity'],
          shortcuts: [
            {
              name: 'Connect USB (Chromebook)',
              short_name: 'USB Serial',
              description: 'Plug in Arduino Uno directly via Chromebook USB port',
              url: '/?action=connect_usb',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Connect Bluetooth (HC-05)',
              short_name: 'Bluetooth',
              description: 'Connect to Arduino HC-05 module wirelessly',
              url: '/?action=connect_bt',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: '3D Parking Yard',
              short_name: '3D View',
              description: 'View full 3D interactive parking lot',
              url: '/?action=fullscreen',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Avoid iframe SW registration errors during dev preview
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
