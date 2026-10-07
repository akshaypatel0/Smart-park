import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationSettings {
  enabled: boolean;
  notifyOnFull: boolean;
  notifyOnSpotFree: boolean;
  notifyOnParked: boolean;
  notifyOnGate: boolean;
  soundEnabled: boolean;
}

export interface InAppToast {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

type ToastListener = (toast: InAppToast) => void;

const SETTINGS_STORAGE_KEY = 'smartparking_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  notifyOnFull: true,
  notifyOnSpotFree: true,
  notifyOnParked: true,
  notifyOnGate: false, // Default off to reduce unnecessary noise
  soundEnabled: true,
};

class SmartNotificationService {
  private settings: NotificationSettings = { ...DEFAULT_SETTINGS };
  private toastListeners: Set<ToastListener> = new Set();
  private lastAlerts: Map<string, number> = new Map();
  private notificationCounter = 1;
  private permissionGranted = false;

  constructor() {
    this.loadSettings();
    this.checkPermissionStatus();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  public saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public subscribeToasts(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  public async checkPermissionStatus(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const check = await LocalNotifications.checkPermissions();
        this.permissionGranted = check.display === 'granted';
        return this.permissionGranted;
      } catch {
        return false;
      }
    } else if (typeof window !== 'undefined') {
      try {
        if ('Notification' in window) {
          this.permissionGranted = Notification.permission === 'granted';
          return this.permissionGranted;
        }
      } catch {
        return false;
      }
    }
    return false;
  }

  public async requestPermissions(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const req = await LocalNotifications.requestPermissions();
        this.permissionGranted = req.display === 'granted';
        return this.permissionGranted;
      } catch (e) {
        console.warn('Native LocalNotifications request failed:', e);
        return false;
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        this.permissionGranted = res === 'granted';
        return this.permissionGranted;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Anti-Spam check: Ensures notifications of identical key cannot fire within cooldown period (default 12 seconds).
   */
  private isSpam(key: string, cooldownMs = 12000): boolean {
    const now = Date.now();
    const last = this.lastAlerts.get(key) || 0;
    if (now - last < cooldownMs) {
      return true;
    }
    this.lastAlerts.set(key, now);
    return false;
  }

  /**
   * Dispatch notification to Native Android Notification Tray, Web Browser Notifications, and In-App Toast.
   */
  public async sendNotification(
    key: string,
    title: string,
    body: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    cooldownMs = 12000
  ) {
    if (!this.settings.enabled) return;

    if (this.isSpam(key, cooldownMs)) {
      return;
    }

    const toast: InAppToast = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      type,
      timestamp: Date.now(),
    };

    // 1. In-App Heads Up Toast
    this.toastListeners.forEach((fn) => {
      try {
        fn(toast);
      } catch (err) {
        console.error('Toast listener error:', err);
      }
    });

    // 2. Native Android Notification (shows on lockscreen / status bar)
    if (Capacitor.isNativePlatform()) {
      try {
        if (!this.permissionGranted) {
          await this.requestPermissions();
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id: this.notificationCounter++,
              title,
              body,
              smallIcon: 'ic_launcher_round',
              iconColor: type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#06b6d4',
              sound: this.settings.soundEnabled ? undefined : undefined,
            },
          ],
        });
      } catch (err) {
        console.warn('Native LocalNotification dispatch failed:', err);
      }
    }
    // 3. Web Notification (in standard browser)
    else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.png',
          badge: '/favicon.png',
        });
      } catch (err) {
        console.warn('Web notification dispatch failed:', err);
      }
    }
  }

  // --- Specific Useful Notification Triggers ---

  public notifyParkingFull() {
    if (!this.settings.notifyOnFull) return;
    this.sendNotification(
      'alert_parking_full',
      '⚠️ PARKING FULL',
      'All 3 bays are occupied (3/3). Gate is CLOSED.',
      'warning',
      20000 // 20s cooldown
    );
  }

  public notifySpotAvailable(lotId: number, availableCount: number) {
    if (!this.settings.notifyOnSpotFree) return;
    this.sendNotification(
      `alert_spot_free_${lotId}`,
      '🟢 Parking Spot Available!',
      `LOT ${lotId} is now FREE (${availableCount} slot${availableCount > 1 ? 's' : ''} available). Gate is OPEN.`,
      'success',
      15000 // 15s cooldown
    );
  }

  public notifyVehicleParked(lotId: number, totalOccupied: number) {
    if (!this.settings.notifyOnParked) return;
    this.sendNotification(
      `alert_lot_occupied_${lotId}`,
      `🚗 Vehicle Parked in LOT ${lotId}`,
      `LOT ${lotId} is now OCCUPIED. Total occupied: ${totalOccupied}/3.`,
      'info',
      15000 // 15s cooldown
    );
  }

  public notifyGateState(isOpen: boolean) {
    if (!this.settings.notifyOnGate) return;
    this.sendNotification(
      'alert_gate_change',
      isOpen ? '🟢 Gate Opened' : '🔴 Gate Closed',
      isOpen ? 'MG995 servo opened entrance gate (0°).' : 'MG995 servo closed entrance gate (90°).',
      isOpen ? 'info' : 'warning',
      10000
    );
  }

  public notifyPaymentDeducted(slotId: number, plate: string, amount: number, durationSeconds: number) {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    this.sendNotification(
      `payment_deducted_${slotId}_${Date.now()}`,
      `💰 Auto-Deducted: ₹${amount.toFixed(2)}`,
      `${plate} departed LOT ${slotId} (${timeStr} parked). Payment successful & collection updated.`,
      'success',
      2000
    );
  }

  public notifyHardwareConnected(name: string) {
    this.sendNotification(
      'alert_hardware_connect',
      '🔌 Hardware Connected',
      `Live telemetry stream active from ${name} @ 9600 baud.`,
      'success',
      10000
    );
  }

  public notifyHardwareDisconnected(reason?: string) {
    this.sendNotification(
      'alert_hardware_disconnect',
      '⚠️ Hardware Disconnected',
      reason ? `Connection closed: ${reason}` : 'Hardware disconnected or paused.',
      'error',
      10000
    );
  }
}

export const notificationService = new SmartNotificationService();
