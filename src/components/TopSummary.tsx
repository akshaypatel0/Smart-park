import React, { useState, useEffect } from 'react';
import { SlotData, GateState, ConnectionMode, ArduinoSummaryData } from '../types';
import {
  Car,
  ParkingSquare,
  ShieldCheck,
  ShieldAlert,
  Bluetooth,
  Usb,
  Radio,
  Download,
  CheckCircle2,
  IndianRupee,
  Receipt,
  Laptop,
  AlertTriangle,
  QrCode,
  Globe,
} from 'lucide-react';
import { downloadArduinoInoFile } from '../utils/downloadFirmware';

interface TopSummaryProps {
  slots: SlotData[];
  arduinoSummary?: ArduinoSummaryData | null;
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  connectionMode: ConnectionMode;
  portLabel?: string;
  isLightMode?: boolean;
  lastDataReceivedAt?: number | null;
  onConnectBluetooth?: () => void;
  onOpenReceipts?: () => void;
  onOpenChromeOSGuide?: () => void;
  onOpenQRModal?: () => void;
  isCloudSyncActive?: boolean;
  isChromeOS?: boolean;
  isReadOnlyView?: boolean;
}

export const TopSummary: React.FC<TopSummaryProps> = ({
  slots,
  arduinoSummary,
  gateState,
  connectionMode,
  portLabel,
  isLightMode = false,
  lastDataReceivedAt,
  onConnectBluetooth,
  onOpenReceipts,
  onOpenChromeOSGuide,
  onOpenQRModal,
  isCloudSyncActive = false,
  isChromeOS = false,
  isReadOnlyView = false,
}) => {
  const [now, setNow] = useState(Date.now());
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const secondsSinceLastData = lastDataReceivedAt ? Math.round((now - lastDataReceivedAt) / 1000) : null;
  const isStale = isConnected && secondsSinceLastData !== null && secondsSinceLastData >= 5;

  const totalSlots = arduinoSummary ? arduinoSummary.totalSlots : slots.length;
  const hasLiveDataSource = isConnected || isCloudSyncActive;

  // When live, use active Arduino/Cloud telemetry. When disconnected/offline, report 0 (standby)
  // so live link does NOT freeze showing old stale numbers (e.g. 2 occupied) after disconnect!
  const occupiedCount = hasLiveDataSource
    ? arduinoSummary
      ? arduinoSummary.totalOccupied
      : slots.filter((s) => s.status === 'OCCUPIED').length
    : 0;

  const freeCount = Math.max(0, totalSlots - occupiedCount);
  const isParkingFull = totalSlots > 0 && occupiedCount >= totalSlots;

  const effectiveGateStatus = arduinoSummary ? arduinoSummary.gate : gateState.status;
  const isGateOpen = effectiveGateStatus === 'OPEN';

  // Compute Grand Total Collection across all lots
  const grandTotalCollection = slots.reduce((acc, s) => acc + (s.totalCollection || 0), 0);
  const liveActiveCharges = isConnected
    ? slots.reduce((acc, s) => acc + (s.status === 'OCCUPIED' ? (s.currentCharge || 0) : 0), 0)
    : 0;

  const cardBaseStyle = isLightMode
    ? 'bg-white border-slate-200 shadow-xs text-slate-900'
    : 'glass-panel border-slate-800/80 shadow-md text-white';

  const handleDownloadCode = () => {
    downloadArduinoInoFile();
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      {/* Live Status Bar & Actions */}
      <div
        className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs font-mono transition-colors ${
          isReadOnlyView
            ? isCloudSyncActive
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : isLightMode
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : isConnected
            ? isStale
              ? isLightMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : isLightMode
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : isLightMode
            ? 'bg-white border-slate-200 text-slate-600'
            : 'glass-panel border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center flex-wrap gap-1.5 min-w-0">
          {isReadOnlyView ? (
            isCloudSyncActive ? (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-bold">લાખાપર સ્માર્ટ પાર્કિંગ · રીઅલ-ટાઇમ લાઈવ પ્રસારણ</span>
                {secondsSinceLastData !== null && (
                  <span className="opacity-75 hidden sm:inline">
                    ({secondsSinceLastData <= 1 ? 'હમણાં જ' : `${secondsSinceLastData}s પહેલાં`})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">હાર્ડવેર સ્ટેન્ડબાય (Bluetooth Disconnected)</span>
                <span className="opacity-75 hidden sm:inline">· ફોનમાંથી બ્લૂટૂથ કનેક્ટ થવાની રાહ જોવાઈ રહી છે</span>
              </div>
            )
          ) : isConnected ? (
            <>
              {connectionMode === 'connected_bt' ? (
                <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 truncate">
                  <Bluetooth className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{portLabel || 'HC-05 Connected'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400 truncate">
                  <Usb className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{portLabel || 'Arduino USB Connected'}</span>
                </span>
              )}
              <span className="hidden sm:inline opacity-40">·</span>
              {isStale ? (
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Connection may be lost</span>
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] opacity-80">
                  {secondsSinceLastData !== null && secondsSinceLastData <= 1
                    ? 'Live Stream'
                    : secondsSinceLastData !== null
                    ? `${secondsSinceLastData}s ago`
                    : 'Active'}
                </span>
              )}
            </>
          ) : isCloudSyncActive ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-bold">Live Cloud Stream (ઇન્ટરનેટ લાઇવ)</span>
              {secondsSinceLastData !== null && (
                <span className="opacity-75">
                  ({secondsSinceLastData <= 1 ? 'Live' : `${secondsSinceLastData}s ago`})
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Connect Bluetooth to start live meter &amp; sensors</span>
            </div>
          )}
        </div>

        {/* Dynamic Actions */}
        {isReadOnlyView ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {isCloudSyncActive ? (
              <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE STREAM</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>STANDBY</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Public Live QR Code Share Button */}
            {onOpenQRModal && (
              <button
                onClick={onOpenQRModal}
                className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[32px]"
                title="Public Live QR Code: Share link so anyone can view live parking"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-500" />
                <span>QR Code</span>
              </button>
            )}

            {onOpenChromeOSGuide && (
              <button
                onClick={onOpenChromeOSGuide}
                className={`px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[32px] ${
                  isChromeOS
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                }`}
                title="ChromeOS Shortcuts & Direct USB Guide"
              >
                <Laptop className="w-3 h-3 text-cyan-500" />
                <span className="hidden xs:inline">ChromeOS</span>
              </button>
            )}

            {onOpenReceipts && (
              <button
                onClick={onOpenReceipts}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[32px]"
                title="View automated payment receipts"
              >
                <Receipt className="w-3 h-3 text-amber-500" />
                <span>Receipts</span>
              </button>
            )}

            {isConnected ? (
              <button
                onClick={handleDownloadCode}
                className="px-2.5 py-1 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[32px]"
                title="Download the exact Arduino C++ firmware (.ino) running on this Arduino"
              >
                {hasDownloaded ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="hidden xs:inline">Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                    <span>Code (.ino)</span>
                  </>
                )}
              </button>
            ) : (
              onConnectBluetooth && (
                <button
                  onClick={onConnectBluetooth}
                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[32px]"
                >
                  <Bluetooth className="w-3 h-3" />
                  <span>Connect</span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* 4 Core Metric Cards: 2x2 Grid on Mobile for Maximum Ergonomics & Zero Scrolling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* 1. AVAILABLE SPACES */}
        <div
          className={`rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
            freeCount > 0
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-sm'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate">
              AVAILABLE
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
                {freeCount}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold opacity-70">
                / {totalSlots}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 bg-emerald-500/20 text-emerald-600 border-emerald-500/40 ml-1">
            <ParkingSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 2. OCCUPIED SPACES */}
        <div
          className={`rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
            isParkingFull
              ? isLightMode
                ? 'bg-rose-50/90 border-rose-300 text-slate-900 shadow-sm'
                : 'border-rose-500/40 bg-rose-950/20 text-white shadow-[0_4px_20px_rgba(244,63,94,0.15)]'
              : cardBaseStyle
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${
                  isParkingFull
                    ? 'text-rose-600 dark:text-rose-400'
                    : isLightMode
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              >
                OCCUPIED
              </span>
              {isParkingFull && (
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                  FULL
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight ${
                  isParkingFull ? 'text-rose-600 dark:text-rose-400' : isLightMode ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                {occupiedCount}
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-semibold opacity-70">
                / {totalSlots}
              </span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ml-1 ${
              isParkingFull
                ? 'bg-rose-500/20 text-rose-600 border-rose-500/40'
                : isLightMode
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            <Car className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* 3. PARKING RATE (READ-ONLY) OR TOTAL COLLECTION (ADMIN) */}
        {isReadOnlyView ? (
          <div
            className={`rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
              isLightMode
                ? 'bg-cyan-50/90 border-cyan-300 text-slate-900 shadow-sm'
                : 'border-cyan-500/40 bg-cyan-950/20 text-white shadow-[0_4px_20px_rgba(6,182,212,0.15)]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block truncate">
                PARKING RATE
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-mono font-black tabular-nums tracking-tight text-cyan-600 dark:text-cyan-400">
                  ₹10
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold opacity-80">
                  / MINUTE
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 ml-1">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
              isLightMode
                ? 'bg-amber-50/90 border-amber-300 text-slate-900 shadow-sm'
                : 'border-amber-500/40 bg-amber-950/20 text-white shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">
                COLLECTION
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-mono font-black tabular-nums tracking-tight text-amber-600 dark:text-amber-400">
                  ₹{grandTotalCollection}
                </span>
                {liveActiveCharges > 0 && (
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    +₹{liveActiveCharges.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 ml-1">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        )}

        {/* 4. BARRIER GATE */}
        <div
          className={`rounded-2xl p-3 sm:p-4 flex items-center justify-between border transition-all ${
            isGateOpen
              ? isLightMode
                ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-sm'
                : 'border-emerald-500/40 bg-emerald-950/20 text-white shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
              : isLightMode
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : 'border-slate-800 bg-slate-900/40 text-white'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block truncate ${
                isGateOpen
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isLightMode
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              BARRIER GATE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-sm sm:text-base font-mono font-black uppercase tracking-wider truncate ${
                  isGateOpen ? 'text-emerald-600 dark:text-emerald-400' : isLightMode ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                {effectiveGateStatus === 'OPEN' ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ml-1 ${
              isGateOpen
                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                : isLightMode
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isGateOpen ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
