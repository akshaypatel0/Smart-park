export type SlotId = 1 | 2 | 3;
export type SlotStatus = 'EMPTY' | 'OCCUPIED' | 'UNKNOWN' | 'AVAILABLE';

export type ThemeMode = 'light' | 'dark';

export interface CarVisualConfig {
  bodyColor: string;
  roofColor: string;
  accentColor: string;
  modelName: string;
  plate: string;
  type?: 'sedan' | 'suv' | 'hatchback';
}

export interface ParkingReceipt {
  id: string;
  slotId: SlotId;
  slotName: string;
  plate: string;
  modelName: string;
  entryTime: number;
  exitTime: number;
  durationSeconds: number;
  amountPaid: number;
  timestamp: number;
}

export interface SlotData {
  id: SlotId;
  name: string;
  status: SlotStatus;
  distance: number; // in cm
  unit?: string; // e.g. 'cm'
  pressure?: number; // legacy FSR reading if reported
  fsr?: number; // legacy FSR reading
  lastUpdated: number; // timestamp of last reading
  car: CarVisualConfig;
  hasHardwareReading: boolean;
  
  // Pricing & Collection Features
  parkedSince?: number | null; // Timestamp ms when vehicle arrived
  currentCharge: number; // Live accumulated fee in Rupees (updating every 3s)
  totalCollection: number; // Cumulative revenue in Rupees collected by this specific lot
  lastDeduction?: ParkingReceipt | null; // Most recent settled payment receipt
}

export interface ArduinoSummaryData {
  totalOccupied: number;
  totalSlots: number;
  occupiedFraction: string; // e.g. "1/3"
  empty: number;
  unknown: number;
  available: number;
  gate: 'OPEN' | 'CLOSED';
  lastUpdated: number;
}

export type ConnectionMode = 'disconnected' | 'connecting' | 'connected_usb' | 'connected_bt';

export interface GateState {
  angle: number; // 0 (Open) to 90 (Closed)
  status: 'OPEN' | 'CLOSED';
}

export interface BuzzerState {
  active: boolean;
  pulseCount: 1 | 2 | 3;
  currentPulse: number;
  audioEnabled: boolean;
  lastTriggered: number;
  hardwareBuzzerOn: boolean; // D8 status on Arduino Uno
}

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  line: string;
  type: 'incoming' | 'system' | 'buzzer' | 'error';
}

export type CameraView = 'isometric' | 'topdown' | 'driver';

export interface ArduinoPortDetails {
  usbVendorId?: number;
  usbProductId?: number;
  portLabel?: string;
  connectionType?: 'usb' | 'bluetooth';
}

export const PARKING_RATE_PER_MINUTE = 10; // ₹10 per minute
export const CHARGE_UPDATE_INTERVAL_MS = 3000; // Updated every 3 seconds
