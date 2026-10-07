// Universal Bluetooth Manager for Smart Parking System
// Supports:
// 1. Android Native APK - Bluetooth Classic SPP (HC-05 / HC-06) via native BluetoothClassicSerialPlugin
// 2. Android Native APK - Bluetooth Low Energy (HM-10 / CC2541 / ESP32) via BleClient
// 3. Desktop & Mobile Chromium Browser (Web Bluetooth API & Web Serial USB OTG)

import { Capacitor, registerPlugin } from '@capacitor/core';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';

// Common Bluetooth Serial / UART Service UUIDs
export const UART_SERVICE_UUIDS = [
  '0000ffe0-0000-1000-8000-00805f9b34fb', // Standard HC-05 / CC2541 / HM-10 UART
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
  '00001101-0000-1000-8000-00805f9b34fb', // Standard Serial Port Profile (SPP)
];

export const UART_CHARACTERISTIC_RX_UUIDS = [
  '0000ffe1-0000-1000-8000-00805f9b34fb', // HC-05 / HM-10 TX/RX
  '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX (Receive on phone)
];

export interface BluetoothClassicSerialPlugin {
  isEnabled(): Promise<{ enabled: boolean }>;
  listPairedDevices(): Promise<{ devices: Array<{ name: string; address: string; type: string }> }>;
  connect(options?: { address?: string }): Promise<{ connected: boolean; name: string; address: string }>;
  disconnect(): Promise<{ disconnected: boolean }>;
  write(options: { data: string }): Promise<void>;
  addListener(eventName: 'data', listenerFunc: (data: { line: string }) => void): Promise<any>;
  addListener(eventName: 'disconnected', listenerFunc: () => void): Promise<any>;
  removeAllListeners(): Promise<void>;
}

export const BluetoothClassicSerial = registerPlugin<BluetoothClassicSerialPlugin>('BluetoothClassicSerial');

export interface DiscoveredBluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  type?: 'classic' | 'ble';
  nativeResult?: any;
}

export class HC05BluetoothManager {
  private connectedDeviceId: string | null = null;
  private connectedDeviceName: string = 'HC-05 Bluetooth';
  private webDevice: any = null;
  private onLineReceivedCallback: ((line: string) => void) | null = null;
  private onDisconnectCallback: ((error?: Error) => void) | null = null;
  private buffer = '';
  private isScanning = false;
  private isNativeBleInitialized = false;
  private isClassicConnected = false;

  public static isSupported(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true; // Supported natively on Android for both Classic (HC-05) and BLE (HM-10)
    }
    if (typeof window !== 'undefined' && 'bluetooth' in navigator) {
      return true; // Supported via Web Bluetooth in Chromium
    }
    return false;
  }

  public setCallbacks(
    onLine: (line: string) => void,
    onDisconnect: (error?: Error) => void
  ) {
    this.onLineReceivedCallback = onLine;
    this.onDisconnectCallback = onDisconnect;
  }

  public getDeviceName(): string {
    return this.connectedDeviceName || 'HC-05 Bluetooth';
  }

  public isConnected(): boolean {
    if (Capacitor.isNativePlatform()) {
      return !!this.connectedDeviceId;
    }
    return !!this.webDevice?.gatt?.connected;
  }

  private async ensureNativeBleInit() {
    if (Capacitor.isNativePlatform() && !this.isNativeBleInitialized) {
      try {
        await BleClient.initialize();
        this.isNativeBleInitialized = true;
      } catch (err) {
        console.warn('BleClient initialize warning:', err);
      }
    }
  }

  /**
   * Scan for nearby Bluetooth devices (Classic HC-05 paired devices + BLE peripherals)
   */
  public async scanForDevices(
    onDeviceFound: (device: DiscoveredBluetoothDevice) => void,
    timeoutMs = 8000
  ): Promise<void> {
    if (this.isScanning) {
      await this.stopScan();
    }

    if (Capacitor.isNativePlatform()) {
      const foundMap = new Map<string, DiscoveredBluetoothDevice>();

      // 1. First, query all paired Classic Bluetooth devices (HC-05 / HC-06)
      try {
        const paired = await BluetoothClassicSerial.listPairedDevices();
        if (paired && paired.devices) {
          for (const dev of paired.devices) {
            const item: DiscoveredBluetoothDevice = {
              id: dev.address,
              name: dev.name || 'HC-05 Classic Bluetooth',
              type: 'classic',
            };
            foundMap.set(dev.address, item);
            onDeviceFound(item);
          }
        }
      } catch (err) {
        console.warn('BluetoothClassicSerial.listPairedDevices warning:', err);
      }

      // 2. Also scan for BLE modules (HM-10 / AT-09 / CC2541)
      await this.ensureNativeBleInit();
      try {
        const isEnabled = await BleClient.isEnabled();
        if (!isEnabled) {
          await BleClient.requestEnable().catch(() => {});
        }

        this.isScanning = true;

        await BleClient.requestLEScan(
          {
            services: [],
            allowDuplicates: false,
          },
          (result: ScanResult) => {
            const id = result.device.deviceId;
            const name = result.device.name || result.localName || 'Bluetooth Device';
            const dev: DiscoveredBluetoothDevice = {
              id,
              name,
              rssi: result.rssi,
              type: 'ble',
              nativeResult: result,
            };
            if (!foundMap.has(id)) {
              foundMap.set(id, dev);
              onDeviceFound(dev);
            }
          }
        );

        setTimeout(async () => {
          if (this.isScanning) {
            await this.stopScan();
          }
        }, timeoutMs);
      } catch (err) {
        this.isScanning = false;
        // If we found paired classic devices, don't fail completely
        if (foundMap.size === 0) {
          throw err;
        }
      }
    } else {
      // In Web Bluetooth, active background scanning is restricted by browser security policies;
      if (!('bluetooth' in navigator)) {
        throw new Error(
          'Web Bluetooth is not available in this browser. Please use Chrome on Android or connect via USB OTG cable.'
        );
      }
    }
  }

  public async stopScan(): Promise<void> {
    if (Capacitor.isNativePlatform() && this.isScanning) {
      try {
        await BleClient.stopLEScan();
      } catch (e) {
        // ignore
      }
    }
    this.isScanning = false;
  }

  /**
   * Connect to HC-05 (Classic Bluetooth SPP) or BLE module
   */
  public async connect(targetDeviceId?: string): Promise<boolean> {
    // A. Native Android Platform (Supports Old HC-05 Classic Bluetooth + BLE)
    if (Capacitor.isNativePlatform()) {
      // 1. Attempt Native Bluetooth Classic SPP first (for HC-05 / HC-06)
      try {
        const res = await BluetoothClassicSerial.connect({ address: targetDeviceId });
        if (res && res.connected) {
          this.connectedDeviceId = res.address;
          this.connectedDeviceName = res.name || 'HC-05 Bluetooth (Classic SPP)';
          this.isClassicConnected = true;

          await BluetoothClassicSerial.removeAllListeners().catch(() => {});
          await BluetoothClassicSerial.addListener('data', (d: { line: string }) => {
            if (d.line && this.onLineReceivedCallback) {
              this.onLineReceivedCallback(d.line);
            }
          });
          await BluetoothClassicSerial.addListener('disconnected', () => {
            this.cleanup();
            if (this.onDisconnectCallback) {
              this.onDisconnectCallback();
            }
          });

          return true;
        }
      } catch (classicErr: any) {
        console.warn('Native Classic Bluetooth connect attempted:', classicErr?.message || classicErr);
        // If an explicit address was passed or it was an HC-05, throw the clear error
        if (targetDeviceId && targetDeviceId.includes(':')) {
          throw new Error(
            classicErr?.message ||
              'Failed to connect to HC-05. Please make sure HC-05 is powered and paired in Android Settings with PIN 1234.'
          );
        }
      }

      // 2. Fallback to Native BLE (for HM-10 / CC2541)
      await this.ensureNativeBleInit();
      try {
        let deviceId = targetDeviceId;

        if (!deviceId) {
          const device = await BleClient.requestDevice({
            services: [],
            optionalServices: UART_SERVICE_UUIDS,
          });
          deviceId = device.deviceId;
          this.connectedDeviceName = device.name || 'Arduino Wireless';
        }

        if (!deviceId) {
          throw new Error('No Bluetooth device selected.');
        }

        this.connectedDeviceId = deviceId;
        this.isClassicConnected = false;

        await BleClient.connect(deviceId, (disconnectedId) => {
          console.log(`Native Bluetooth device disconnected: ${disconnectedId}`);
          this.cleanup();
          if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
          }
        });

        // Search for UART services & start notification streaming
        const services = await BleClient.getServices(deviceId);
        let hooked = false;

        for (const s of services) {
          for (const c of s.characteristics) {
            if (c.properties.notify || c.properties.indicate) {
              await BleClient.startNotifications(
                deviceId,
                s.uuid,
                c.uuid,
                (val: DataView) => {
                  this.handleIncomingData(val);
                }
              );
              hooked = true;
              break;
            }
          }
          if (hooked) break;
        }

        return true;
      } catch (err: unknown) {
        this.cleanup();
        throw err;
      }
    }

    // B. Standard Web Bluetooth API (Chrome / Edge Browser)
    if (!('bluetooth' in navigator)) {
      throw new Error(
        'Web Bluetooth is not supported in this browser. Please use Google Chrome on Android or connect via USB OTG cable.'
      );
    }

    try {
      const nav = navigator as unknown as {
        bluetooth: {
          requestDevice(options: any): Promise<any>;
        };
      };

      try {
        this.webDevice = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            '00001101-0000-1000-8000-00805f9b34fb',
            0xffe0,
            0xffe1,
          ],
        });
      } catch (firstErr: any) {
        if (firstErr?.name === 'NotFoundError') {
          throw new Error(
            'HC-05 not showing up in browser? Web Bluetooth in Chrome only discovers BLE devices (like HM-10/AT-09). To use old HC-05, install the Native Android APK (which supports classic HC-05) or connect via USB OTG cable.'
          );
        }
        this.webDevice = await nav.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'HC' },
            { namePrefix: 'HC-05' },
            { namePrefix: 'HC-06' },
            { namePrefix: 'HM' },
            { namePrefix: 'BT' },
            { namePrefix: 'Arduino' },
          ],
          optionalServices: [
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            '00001101-0000-1000-8000-00805f9b34fb',
            0xffe0,
            0xffe1,
          ],
        });
      }

      this.connectedDeviceName = this.webDevice.name || 'HC-05 Bluetooth';

      if (!this.webDevice.gatt) {
        throw new Error('Device does not support GATT connection.');
      }

      this.webDevice.addEventListener('gattserverdisconnected', () => {
        this.cleanup();
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      });

      const server = await this.webDevice.gatt.connect();

      // Find compatible UART service
      let service: any = null;
      for (const uuid of UART_SERVICE_UUIDS) {
        try {
          service = await server.getPrimaryService(uuid);
          if (service) break;
        } catch {
          // continue
        }
      }

      if (!service) {
        const services = await server.getPrimaryServices();
        if (services.length > 0) {
          service = services[0];
        }
      }

      if (!service) {
        throw new Error('Could not find compatible UART / Serial service on device.');
      }

      const characteristics = await service.getCharacteristics();
      const rxChar = characteristics.find(
        (c: any) => c.properties?.notify || c.properties?.indicate
      ) || characteristics[0];

      if (rxChar) {
        await rxChar.startNotifications();
        rxChar.addEventListener('characteristicvaluechanged', (e: any) => {
          if (e.target?.value) {
            this.handleIncomingData(e.target.value);
          }
        });
      }

      return true;
    } catch (err: unknown) {
      this.cleanup();
      throw err;
    }
  }

  private handleIncomingData(value: DataView) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(value);
    this.buffer += text;

    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const clean = line.trim();
      if (clean && this.onLineReceivedCallback) {
        this.onLineReceivedCallback(clean);
      }
    }
  }

  public disconnect(): void {
    try {
      if (Capacitor.isNativePlatform()) {
        if (this.isClassicConnected) {
          BluetoothClassicSerial.disconnect().catch(() => {});
        }
        if (this.connectedDeviceId) {
          BleClient.disconnect(this.connectedDeviceId).catch(() => {});
        }
      } else if (this.webDevice?.gatt?.connected) {
        this.webDevice.gatt.disconnect();
      }
    } catch (err) {
      console.warn('Bluetooth disconnect error:', err);
    } finally {
      this.cleanup();
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    }
  }

  private cleanup() {
    this.connectedDeviceId = null;
    this.webDevice = null;
    this.buffer = '';
    this.isScanning = false;
    this.isClassicConnected = false;
  }
}

export const hc05Bluetooth = new HC05BluetoothManager();
