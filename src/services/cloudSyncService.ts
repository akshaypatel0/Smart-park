// Cloud Synchronization Service for Smart Parking System
// Enables real-time telemetry sharing from Gateway Mobile (Bluetooth -> Cloud)
// to GitHub Pages Live Link & Public Viewers via Firebase Firestore.

import { SlotStatus, CarVisualConfig } from '../types';
import { db, handleFirestoreError, OperationType, testFirebaseConnection } from './firebase';
import { doc, setDoc, onSnapshot, Unsubscribe, getDoc } from 'firebase/firestore';

export interface ParkingCloudSlot {
  id: 1 | 2 | 3;
  name: string;
  status: SlotStatus;
  distance: number;
  unit: string;
  updatedAt: string;
  hasHardwareReading?: boolean;
  currentCharge?: number;
  parkedSince?: number | null;
  car?: CarVisualConfig;
}

export interface ParkingCloudState {
  slots: ParkingCloudSlot[];
  gate: 'OPEN' | 'CLOSED';
  gateAngle: number;
  buzzerOn: boolean;
  totalOccupied: number;
  totalSlots: number;
  lastUpdated: number;
  isHardwareConnected?: boolean;
  isOnline?: boolean;
  statusMessage?: string;
  source: 'gateway_bt' | 'gateway_usb' | 'simulator' | 'cloud' | 'disconnected';
  systemId?: string;
}

class CloudSyncService {
  private isBroadcasting = true;
  private lastBroadcastTime = 0;
  private minBroadcastInterval = 600; // ms throttle for smooth updates
  private activeListeners: ((state: ParkingCloudState) => void)[] = [];
  private lastKnownState: ParkingCloudState | null = null;
  private lastSuccessfulSync = 0;
  private packetsSentCount = 0;
  private unsubscribeFirestore: Unsubscribe | null = null;
  private systemId = 'lakha-par-main';
  private firestoreAvailable = true;
  private isConnectedToFirebase = false;

  constructor() {
    // Check if cloud broadcast preference is saved
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartparking_cloud_broadcast');
      if (saved !== null) {
        this.isBroadcasting = saved === 'true';
      }

      // Check URL for custom system ID (?sys=...)
      try {
        const params = new URLSearchParams(window.location.search);
        const sys = params.get('sys');
        if (sys && /^[a-zA-Z0-9_\-]+$/.test(sys)) {
          this.systemId = sys;
        } else {
          const savedSys = localStorage.getItem('smartparking_system_id');
          if (savedSys && /^[a-zA-Z0-9_\-]+$/.test(savedSys)) {
            this.systemId = savedSys;
          }
        }
      } catch {}

      // Initial connection check
      testFirebaseConnection()
        .then((ok) => {
          this.isConnectedToFirebase = ok;
        })
        .catch(() => {
          this.isConnectedToFirebase = false;
        });
    }
  }

  public getSystemId(): string {
    return this.systemId;
  }

  public setSystemId(id: string) {
    const clean = id.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '-');
    if (clean) {
      this.systemId = clean;
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartparking_system_id', clean);
      }
      // Re-subscribe if already listening
      if (this.activeListeners.length > 0) {
        this.restartSubscription();
      }
    }
  }

  public setBroadcasting(enabled: boolean) {
    this.isBroadcasting = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartparking_cloud_broadcast', String(enabled));
    }
  }

  public getBroadcasting(): boolean {
    return this.isBroadcasting;
  }

  public getLastSyncTime(): number {
    return this.lastSuccessfulSync;
  }

  public getPacketsSent(): number {
    return this.packetsSentCount;
  }

  public getFirebaseStatus(): boolean {
    return this.isConnectedToFirebase;
  }

  // Format payload for Firestore according to blueprint schema & rules
  private prepareFirestorePayload(state: ParkingCloudState) {
    return {
      systemId: this.systemId,
      name: 'શ્રી સરકારી માધ્યમિક શાળા લાખાપર',
      gate: state.gate === 'CLOSED' ? 'CLOSED' : 'OPEN',
      gateAngle: typeof state.gateAngle === 'number' ? Math.max(0, Math.min(180, Math.round(state.gateAngle))) : 0,
      buzzerOn: Boolean(state.buzzerOn),
      totalOccupied: Math.max(0, Math.min(3, state.totalOccupied || 0)),
      totalSlots: 3,
      isHardwareConnected: Boolean(state.isHardwareConnected),
      isOnline: Boolean(state.isOnline ?? true),
      source: state.source,
      statusMessage: state.statusMessage ? state.statusMessage.substring(0, 250) : '',
      slotsData: JSON.stringify(state.slots),
      updatedAt: new Date(state.lastUpdated || Date.now()).toISOString(),
    };
  }

  // Called when Bluetooth disconnects to immediately notify Cloud / GitHub Pages viewers
  public async broadcastDisconnected(): Promise<boolean> {
    const now = Date.now();
    const payload: ParkingCloudState = {
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
      lastUpdated: now,
      isHardwareConnected: false,
      isOnline: false,
      source: 'disconnected',
      statusMessage: 'Bluetooth disconnected from gateway phone',
      systemId: this.systemId,
    };

    this.lastBroadcastTime = now;
    this.lastKnownState = payload;

    // 1. Write to Firebase Firestore
    try {
      const docRef = doc(db, 'parking', this.systemId);
      const fsPayload = this.prepareFirestorePayload(payload);
      await setDoc(docRef, fsPayload, { merge: true });
      this.lastSuccessfulSync = now;
      this.isConnectedToFirebase = true;
    } catch (err) {
      console.warn('Firebase sync on disconnect error:', err);
    }

    // 2. Also notify local dev endpoint if available
    try {
      await fetch('/api/parking/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}

    return true;
  }

  // Called by Gateway phone connected to Arduino HC-05 Bluetooth or USB
  public async broadcastState(state: Omit<ParkingCloudState, 'lastUpdated'>): Promise<boolean> {
    if (!this.isBroadcasting) return false;

    const now = Date.now();
    if (now - this.lastBroadcastTime < this.minBroadcastInterval) {
      return false; // throttled for bandwidth
    }

    this.lastBroadcastTime = now;

    const fullState: ParkingCloudState = {
      ...state,
      isHardwareConnected: state.isHardwareConnected !== false,
      lastUpdated: now,
      systemId: this.systemId,
    };

    let synced = false;

    // 1. Sync to Firebase Firestore (Global internet live link)
    try {
      const docRef = doc(db, 'parking', this.systemId);
      const fsPayload = this.prepareFirestorePayload(fullState);
      await setDoc(docRef, fsPayload, { merge: true });
      this.lastSuccessfulSync = now;
      this.packetsSentCount++;
      this.isConnectedToFirebase = true;
      this.lastKnownState = fullState;
      synced = true;
    } catch (err) {
      console.warn('Firebase Firestore broadcast error:', err);
      // Fall through to local fallback
    }

    // 2. Dev server sync (local network / preview)
    try {
      const res = await fetch('/api/parking/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullState),
      });
      if (res.ok) {
        synced = true;
      }
    } catch {}

    return synced;
  }

  // Convert raw Firestore document data back into clean ParkingCloudState
  private parseFirestoreDoc(data: any): ParkingCloudState | null {
    if (!data) return null;

    let parsedSlots: ParkingCloudSlot[] = [];
    if (typeof data.slotsData === 'string') {
      try {
        parsedSlots = JSON.parse(data.slotsData);
      } catch {
        parsedSlots = [];
      }
    }

    // Fallback if slots data was empty
    if (!parsedSlots || !parsedSlots.length) {
      parsedSlots = [
        { id: 1, name: 'LOT 1', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
        { id: 2, name: 'LOT 2', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
        { id: 3, name: 'LOT 3', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
      ];
    }

    const updatedAtMs = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();

    return {
      slots: parsedSlots,
      gate: data.gate === 'CLOSED' ? 'CLOSED' : 'OPEN',
      gateAngle: typeof data.gateAngle === 'number' ? data.gateAngle : 0,
      buzzerOn: Boolean(data.buzzerOn),
      totalOccupied: typeof data.totalOccupied === 'number' ? data.totalOccupied : 0,
      totalSlots: typeof data.totalSlots === 'number' ? data.totalSlots : 3,
      lastUpdated: updatedAtMs,
      isHardwareConnected: Boolean(data.isHardwareConnected),
      isOnline: Boolean(data.isOnline),
      source: data.source || 'cloud',
      statusMessage: data.statusMessage || '',
      systemId: data.systemId || this.systemId,
    };
  }

  // Subscribe to Live Updates via Firebase Firestore onSnapshot!
  // Works anywhere: on GitHub Pages, mobile browser, or scanning QR code!
  public startLivePolling(onUpdate: (state: ParkingCloudState) => void) {
    if (!this.activeListeners.includes(onUpdate)) {
      this.activeListeners.push(onUpdate);
    }

    // If initial cached state exists, send immediately
    if (this.lastKnownState) {
      onUpdate(this.lastKnownState);
    }

    // Start real-time Firestore listener if not already running
    if (!this.unsubscribeFirestore) {
      this.setupFirestoreSubscription();
    }
  }

  private setupFirestoreSubscription() {
    try {
      const docRef = doc(db, 'parking', this.systemId);

      this.unsubscribeFirestore = onSnapshot(
        docRef,
        (snapshot) => {
          this.isConnectedToFirebase = true;
          if (snapshot.exists()) {
            const raw = snapshot.data();
            const parsed = this.parseFirestoreDoc(raw);
            if (parsed) {
              this.lastKnownState = parsed;
              this.lastSuccessfulSync = Date.now();
              this.activeListeners.forEach((fn) => fn(parsed));
            }
          } else {
            // Document not yet created by gateway: send initial unknown state
            const emptyState: ParkingCloudState = {
              slots: [
                { id: 1, name: 'LOT 1', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
                { id: 2, name: 'LOT 2', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
                { id: 3, name: 'LOT 3', status: 'UNKNOWN', distance: 0, unit: 'cm', updatedAt: new Date().toISOString() },
              ],
              gate: 'OPEN',
              gateAngle: 0,
              buzzerOn: false,
              totalOccupied: 0,
              totalSlots: 3,
              lastUpdated: 0,
              isHardwareConnected: false,
              isOnline: false,
              source: 'disconnected',
              statusMessage: 'Waiting for Gateway mobile connection...',
              systemId: this.systemId,
            };
            this.lastKnownState = emptyState;
            this.activeListeners.forEach((fn) => fn(emptyState));
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot subscription warning:', error);
          this.isConnectedToFirebase = false;
          // Trigger error handler as required by skill
          try {
            handleFirestoreError(error, OperationType.GET, `parking/${this.systemId}`);
          } catch {}
          // Fallback to fetch / poll
          this.fallbackFetchLatestState();
        }
      );
    } catch (e) {
      console.warn('Failed to attach Firestore snapshot:', e);
      this.fallbackFetchLatestState();
    }
  }

  private restartSubscription() {
    this.stopLivePolling();
    this.setupFirestoreSubscription();
  }

  private async fallbackFetchLatestState() {
    try {
      const res = await fetch('/api/parking/state', { cache: 'no-store' });
      if (res.ok) {
        const data: ParkingCloudState = await res.json();
        this.lastKnownState = data;
        this.lastSuccessfulSync = data.lastUpdated || Date.now();
        this.activeListeners.forEach((fn) => fn(data));
      }
    } catch {}
  }

  public stopLivePolling(onUpdate?: (state: ParkingCloudState) => void) {
    if (onUpdate) {
      this.activeListeners = this.activeListeners.filter((l) => l !== onUpdate);
    } else {
      this.activeListeners = [];
    }

    if (this.activeListeners.length === 0 && this.unsubscribeFirestore) {
      try {
        this.unsubscribeFirestore();
      } catch {}
      this.unsubscribeFirestore = null;
    }
  }
}

export const cloudSync = new CloudSyncService();
