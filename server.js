import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory live parking state for Northflank cloud deployment
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
  source: 'initial',
};

// Health check endpoint for Northflank / container orchestrators
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Stale heartbeat threshold: if main phone hasn't sent data in 4 seconds, mark disconnected
const GATEWAY_HEARTBEAT_TIMEOUT_MS = 4000;

// API: Get latest live parking state for QR code scanners & public viewers
app.get('/api/parking/state', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const now = Date.now();
  const timeSinceLastUpdate = now - (latestParkingState.lastUpdated || 0);

  // If no hardware connected OR gateway stopped broadcasting for > 4s:
  // Reset live state to DISCONNECTED / STANDBY so live link does NOT show stale occupied slots!
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
    return res.json(offlineState);
  }

  res.json({
    ...latestParkingState,
    isHardwareConnected: true,
    isOnline: true,
    timeSinceLastUpdate,
  });
});

// API: Broadcast live parking state from gateway device (connected phone/Arduino)
app.post('/api/parking/state', (req, res) => {
  if (req.body && req.body.slots) {
    const isDisconnected = req.body.isHardwareConnected === false || req.body.source === 'disconnected';
    const isConnected = !isDisconnected;
    latestParkingState = {
      ...req.body,
      isHardwareConnected: isConnected,
      isOnline: isConnected,
      totalOccupied: isConnected ? (req.body.totalOccupied || 0) : 0,
      lastUpdated: isConnected ? Date.now() : 0,
      source: isConnected ? (req.body.source || 'gateway_bt') : 'disconnected',
    };
    return res.status(200).json({ ok: true, lastUpdated: latestParkingState.lastUpdated, isHardwareConnected: isConnected });
  }
  res.status(400).json({ error: 'Invalid parking state' });
});

// Serve static assets from Vite build output (dist/)
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y',
    setHeaders: (res, filePath) => {
      // HTML and manifest should not be cached aggressively to allow instant updates
      if (filePath.endsWith('.html') || filePath.endsWith('.webmanifest')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);

// SPA fallback: any unknown route serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Parking Web App running on port ${PORT}`);
});
