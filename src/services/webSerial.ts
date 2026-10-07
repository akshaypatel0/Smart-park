export interface ParsedSlotData {
  slotId: 1 | 2 | 3;
  distance: number;
  unit: string;
  status: 'EMPTY' | 'OCCUPIED' | 'UNKNOWN' | 'AVAILABLE';
  fsr?: number;
  raw: string;
}

export interface ParsedSummaryData {
  totalOccupied: number;
  totalSlots: number;
  occupiedFraction: string;
  empty: number;
  unknown: number;
  available: number;
  gate: 'OPEN' | 'CLOSED';
  raw: string;
}

export interface ParsedGateBuzzerData {
  gateAngle?: number; // 0 or 90
  gateStatus?: 'OPEN' | 'CLOSED';
  buzzerOn?: boolean;
  pulseCount?: 1 | 2 | 3;
  raw: string;
}

export type SerialParseResult =
  | { type: 'slot'; data: ParsedSlotData }
  | { type: 'summary'; data: ParsedSummaryData }
  | { type: 'gate_buzzer'; data: ParsedGateBuzzerData }
  | { type: 'ignored'; raw: string }
  | { type: 'unknown'; raw: string };

export class SerialLineParser {
  /**
   * Expected formats from Arduino:
   * 1. Lot 1 | Distance: 3.1 cm | Status: EMPTY
   *    Lot 2 | Distance: 2.3 cm | Status: OCCUPIED
   *    Lot 3 | Distance: 4.1 cm | Status: EMPTY
   * 2. TOTAL OCCUPIED: 1/3 | EMPTY: 2 | UNKNOWN: 0 | AVAILABLE: 2 | GATE: OPEN
   * 3. ----------------------------------------------------------------------- (ignored)
   * 4. Legacy format: SLOT 1 | Distance: 2.5 cm | FSR: 45 | STATUS: OCCUPIED
   * 5. GATE: 90 deg | BUZZER: ON
   */
  public static parse(line: string): SerialParseResult {
    const trimmed = line.trim();
    if (!trimmed) return { type: 'ignored', raw: line };

    // 0. Ignore divider / separator lines (e.g. "-------------------" or "=======")
    if (/^[-=_*~#]{3,}$/.test(trimmed)) {
      return { type: 'ignored', raw: trimmed };
    }

    // 0.1 Check for short Arduino HC-05 format:
    // e.g. "S1:OCCUPIED", "S1:1", "S2:EMPTY", "S2:0", "S3:OCCUPIED", "S3:1"
    const hc05SlotMatch = trimmed.match(/^S([1-3])\s*[:=]\s*(OCCUPIED|EMPTY|AVAILABLE|UNKNOWN|VACANT|[01])\b/i);
    if (hc05SlotMatch) {
      const slotNum = parseInt(hc05SlotMatch[1], 10) as 1 | 2 | 3;
      const rawVal = hc05SlotMatch[2].toUpperCase();
      let status: 'EMPTY' | 'OCCUPIED' | 'UNKNOWN' = 'UNKNOWN';
      if (rawVal === 'OCCUPIED' || rawVal === '1') {
        status = 'OCCUPIED';
      } else if (rawVal === 'EMPTY' || rawVal === 'AVAILABLE' || rawVal === 'VACANT' || rawVal === '0') {
        status = 'EMPTY';
      }

      return {
        type: 'slot',
        data: {
          slotId: slotNum,
          distance: status === 'OCCUPIED' ? 2.5 : 25.0,
          unit: 'cm',
          status,
          raw: trimmed,
        },
      };
    }

    // 0.2 Check for short Total Occupied format:
    // e.g. "TOTAL:2", "TOTAL: 2", "TOTAL: 2/3"
    const hc05TotalMatch = trimmed.match(/^TOTAL\s*[:=]\s*(\d+)(?:\s*\/\s*(\d+))?$/i);
    if (hc05TotalMatch) {
      const totalOccupied = parseInt(hc05TotalMatch[1], 10);
      const totalSlots = hc05TotalMatch[2] ? parseInt(hc05TotalMatch[2], 10) : 3;
      const empty = Math.max(0, totalSlots - totalOccupied);
      const gate: 'OPEN' | 'CLOSED' = totalOccupied >= totalSlots ? 'CLOSED' : 'OPEN';

      return {
        type: 'summary',
        data: {
          totalOccupied,
          totalSlots,
          occupiedFraction: `${totalOccupied}/${totalSlots}`,
          empty,
          unknown: 0,
          available: empty,
          gate,
          raw: trimmed,
        },
      };
    }

    // 1. Check for Summary telemetry line:
    // e.g. "TOTAL OCCUPIED: 1/3 | EMPTY: 2 | UNKNOWN: 0 | AVAILABLE: 2 | GATE: OPEN"
    if (/(?:TOTAL\s*OCCUPIED|OCCUPIED\s*:)/i.test(trimmed) && /(?:EMPTY|AVAILABLE|UNKNOWN)/i.test(trimmed)) {
      const occMatch = trimmed.match(/(?:TOTAL\s*OCCUPIED|OCCUPIED):\s*(\d+)(?:\s*\/\s*(\d+))?/i);
      const emptyMatch = trimmed.match(/EMPTY:\s*(\d+)/i);
      const unknownMatch = trimmed.match(/UNKNOWN:\s*(\d+)/i);
      const availMatch = trimmed.match(/AVAILABLE:\s*(\d+)/i);
      const gateMatch = trimmed.match(/GATE:\s*(OPEN|CLOSED)/i);

      if (occMatch || emptyMatch || availMatch || unknownMatch) {
        const totalOccupied = occMatch ? parseInt(occMatch[1], 10) : 0;
        const totalSlots = (occMatch && occMatch[2]) ? parseInt(occMatch[2], 10) : 3;
        const occupiedFraction = (occMatch && occMatch[2])
          ? `${totalOccupied}/${totalSlots}`
          : `${totalOccupied}/${totalSlots}`;
        const empty = emptyMatch ? parseInt(emptyMatch[1], 10) : Math.max(0, totalSlots - totalOccupied);
        const unknown = unknownMatch ? parseInt(unknownMatch[1], 10) : 0;
        const available = availMatch ? parseInt(availMatch[1], 10) : empty;
        const gate = (gateMatch ? gateMatch[1].toUpperCase() : (totalOccupied >= totalSlots ? 'CLOSED' : 'OPEN')) as 'OPEN' | 'CLOSED';

        return {
          type: 'summary',
          data: {
            totalOccupied,
            totalSlots,
            occupiedFraction,
            empty,
            unknown,
            available,
            gate,
            raw: trimmed,
          },
        };
      }
    }

    // 2. Check for Slot / Lot telemetry line:
    // e.g. "Lot 1 | Distance: 3.1 cm | Status: EMPTY"
    // e.g. "Lot 2 | Distance: 2.3 cm | Status: OCCUPIED"
    // e.g. "SLOT 1 | Distance: 2.5 cm | FSR: 45 | STATUS: OCCUPIED"
    if (/(?:LOT|SLOT)\s*[1-3]/i.test(trimmed)) {
      const slotMatch = trimmed.match(/(?:LOT|SLOT)\s*([1-3])/i);
      const distMatch = trimmed.match(/(?:Distance|Dist):\s*([\d.]+)\s*([a-zA-Z]+)?/i);
      const statMatch = trimmed.match(/(?:Status|STATUS):\s*(EMPTY|OCCUPIED|UNKNOWN|AVAILABLE|VACANT)/i);
      const fsrMatch = trimmed.match(/(?:FSR|Pressure):\s*(\d+)/i);

      if (slotMatch) {
        const slotNum = parseInt(slotMatch[1], 10);
        const slotId = (slotNum >= 1 && slotNum <= 3 ? slotNum : 1) as 1 | 2 | 3;
        const distance = distMatch ? parseFloat(distMatch[1]) : 0;
        const unit = (distMatch && distMatch[2]) ? distMatch[2].toLowerCase() : 'cm';
        const fsr = fsrMatch ? parseInt(fsrMatch[1], 10) : undefined;

        // Arduino is the source of truth. Display the status exactly as received:
        // EMPTY, OCCUPIED, or UNKNOWN. Do not independently recalculate slot status from distance!
        let status: 'EMPTY' | 'OCCUPIED' | 'UNKNOWN' | 'AVAILABLE';
        if (statMatch) {
          const rawStatus = statMatch[1].toUpperCase();
          if (rawStatus === 'OCCUPIED') {
            status = 'OCCUPIED';
          } else if (rawStatus === 'UNKNOWN') {
            status = 'UNKNOWN';
          } else if (rawStatus === 'EMPTY' || rawStatus === 'AVAILABLE' || rawStatus === 'VACANT') {
            status = 'EMPTY';
          } else {
            status = 'UNKNOWN';
          }
        } else if (fsr !== undefined) {
          // Legacy format without status label:
          status = (distance <= 3.0 && fsr >= 15) ? 'OCCUPIED' : 'EMPTY';
        } else {
          status = 'UNKNOWN';
        }

        return {
          type: 'slot',
          data: {
            slotId,
            distance,
            unit,
            status,
            fsr,
            raw: trimmed,
          },
        };
      }
    }

    // 3. Standalone Gate and Buzzer telemetry line:
    // e.g. "GATE: OPEN | BUZZER: OFF", "GATE: 90 deg | BUZZER: ON", "GATE: 0"
    const gateMatch = trimmed.match(/(?:GATE|SERVO)[:\s]+(OPEN|CLOSED|\d+)/i);
    const buzzerStateMatch = trimmed.match(/BUZZER[:\s]+(ON|OFF|HIGH|LOW)/i);
    const buzzerPulseMatch = trimmed.match(/(?:BUZZER|BEEP)[:\s]+([1-3])\b/i);

    if (gateMatch || buzzerStateMatch || buzzerPulseMatch) {
      let gateAngle: number | undefined = undefined;
      let gateStatus: 'OPEN' | 'CLOSED' | undefined = undefined;

      if (gateMatch) {
        const gVal = gateMatch[1].toUpperCase();
        if (gVal === 'OPEN') {
          gateStatus = 'OPEN';
          gateAngle = 0;
        } else if (gVal === 'CLOSED') {
          gateStatus = 'CLOSED';
          gateAngle = 90;
        } else if (!isNaN(parseInt(gVal, 10))) {
          gateAngle = parseInt(gVal, 10);
          gateStatus = gateAngle >= 45 ? 'CLOSED' : 'OPEN';
        }
      }

      let buzzerOn: boolean | undefined = undefined;
      if (buzzerStateMatch) {
        const val = buzzerStateMatch[1].toUpperCase();
        buzzerOn = val === 'ON' || val === 'HIGH';
      }

      const pulseCount = buzzerPulseMatch ? (parseInt(buzzerPulseMatch[1], 10) as 1 | 2 | 3) : undefined;

      return {
        type: 'gate_buzzer',
        data: {
          gateAngle,
          gateStatus,
          buzzerOn,
          pulseCount,
          raw: trimmed,
        },
      };
    }

    return { type: 'unknown', raw: trimmed };
  }
}

// Web Serial API types declaration
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<any> | null;
  writable: WritableStream<any> | null;
  getInfo(): SerialPortInfo;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface SerialNavigator {
  serial?: {
    requestPort(options?: unknown): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  };
}

export class ArduinoSerialManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private keepReading = false;
  private onLineReceivedCallback: ((line: string) => void) | null = null;
  private onDisconnectCallback: ((error?: Error) => void) | null = null;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const nav = navigator as unknown as SerialNavigator;
    return !!nav.serial && window.isSecureContext;
  }

  public setCallbacks(
    onLine: (line: string) => void,
    onDisconnect: (error?: Error) => void
  ) {
    this.onLineReceivedCallback = onLine;
    this.onDisconnectCallback = onDisconnect;
  }

  public getPortInfo(): { usbVendorId?: number; usbProductId?: number; label?: string } | null {
    if (!this.port) return null;
    try {
      const info = this.port.getInfo();
      let label = 'Arduino USB Serial';
      if (info.usbVendorId === 0x2341) {
        label = 'Arduino Uno (Official)';
      } else if (info.usbVendorId === 0x1a86) {
        label = 'Arduino Uno (CH340 USB)';
      } else if (info.usbVendorId === 0x0403) {
        label = 'Arduino Uno (FTDI)';
      }
      return {
        usbVendorId: info.usbVendorId,
        usbProductId: info.usbProductId,
        label,
      };
    } catch {
      return { label: 'Arduino Uno Port' };
    }
  }

  public async getAuthorizedPorts(): Promise<SerialPort[]> {
    if (!ArduinoSerialManager.isSupported()) return [];
    const nav = navigator as unknown as SerialNavigator;
    if (!nav.serial) return [];
    try {
      return await nav.serial.getPorts();
    } catch {
      return [];
    }
  }

  public async connect(baudRate = 9600, specificPort?: SerialPort): Promise<boolean> {
    if (!ArduinoSerialManager.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge on Windows 11.');
    }

    const nav = navigator as unknown as SerialNavigator;
    if (!nav.serial) {
      throw new Error('Web Serial API unavailable');
    }

    try {
      // If a specific previously authorized port was chosen, use it; otherwise prompt user
      this.port = specificPort || (await nav.serial.requestPort());

      try {
        await this.port.open({ baudRate });
      } catch (openErr: any) {
        // Specific Windows 11 troubleshooting for COM port lock
        const errMsg = openErr?.message || '';
        if (
          openErr?.name === 'NetworkError' ||
          errMsg.includes('Failed to open') ||
          errMsg.includes('Access denied') ||
          errMsg.includes('device is already open')
        ) {
          throw new Error(
            'Windows COM Port Conflict: The port is currently locked. Please CLOSE the Arduino IDE Serial Monitor, Serial Plotter, or any other app using this COM port, then try connecting again.'
          );
        }
        throw openErr;
      }

      this.keepReading = true;
      this.startReadingLoop();

      return true;
    } catch (err: unknown) {
      this.cleanup();
      throw err;
    }
  }

  private async startReadingLoop() {
    if (!this.port || !this.port.readable) return;

    let buffer = '';
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          // Keep incomplete tail in buffer for next chunk
          buffer = lines.pop() || '';

          for (const line of lines) {
            const clean = line.trim();
            if (clean && this.onLineReceivedCallback) {
              this.onLineReceivedCallback(clean);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Serial read error:', error);
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback(error as Error);
      }
    } finally {
      try {
        if (this.reader) {
          await this.reader.cancel();
          this.reader.releaseLock();
        }
        await readableStreamClosed.catch(() => {});
      } catch {
        // ignore stream close errors
      }
      this.cleanup();
    }
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
      }
      if (this.port) {
        await this.port.close();
      }
    } catch (err) {
      console.warn('Error closing serial port:', err);
    } finally {
      this.cleanup();
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    }
  }

  public isConnected(): boolean {
    return !!this.port && this.keepReading;
  }

  private cleanup() {
    this.port = null;
    this.reader = null;
    this.keepReading = false;
  }
}

export const serialManager = new ArduinoSerialManager();
