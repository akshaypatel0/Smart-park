import React, { useState, useEffect } from 'react';
import { Bluetooth, Activity, Clock, CheckCircle2, AlertTriangle, Radio, Terminal } from 'lucide-react';
import { ConnectionMode } from '../types';

interface BluetoothDiagnosticsProps {
  connectionMode: ConnectionMode;
  portLabel?: string;
  lastRawMessage: string;
  lastDataReceivedAt: number | null;
  validMessageCount: number;
  isLightMode?: boolean;
}

export const BluetoothDiagnostics: React.FC<BluetoothDiagnosticsProps> = ({
  connectionMode,
  portLabel,
  lastRawMessage,
  lastDataReceivedAt,
  validMessageCount,
  isLightMode = false,
}) => {
  const [now, setNow] = useState(Date.now());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = connectionMode === 'connected_bt' || connectionMode === 'connected_usb';
  const isConnecting = connectionMode === 'connecting';
  const secondsSinceLastData = lastDataReceivedAt ? Math.max(0, Math.floor((now - lastDataReceivedAt) / 1000)) : null;
  const isConnectionStale = isConnected && secondsSinceLastData !== null && secondsSinceLastData >= 5;

  // Bluetooth Status details according to requirements:
  // Disconnected → red/gray Bluetooth icon + "Bluetooth Disconnected"
  // Connecting → yellow + "Connecting..."
  // Connected → blue/green Bluetooth icon + "HC-05 Connected"
  let statusText = 'Bluetooth Disconnected';
  let statusColorClass = isLightMode ? 'text-slate-600' : 'text-slate-400';
  let badgeClass = isLightMode ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-300';
  let iconColorClass = 'text-slate-400';

  if (connectionMode === 'connected_bt') {
    statusText = portLabel ? `${portLabel} Connected` : 'HC-05 Connected';
    statusColorClass = 'text-emerald-500 dark:text-emerald-400';
    badgeClass = isLightMode
      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
    iconColorClass = 'text-blue-500 dark:text-cyan-400';
  } else if (connectionMode === 'connected_usb') {
    statusText = portLabel ? `USB: ${portLabel}` : 'Arduino USB Connected';
    statusColorClass = 'text-cyan-500 dark:text-cyan-400';
    badgeClass = isLightMode
      ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
      : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300';
    iconColorClass = 'text-cyan-500';
  } else if (isConnecting) {
    statusText = 'Connecting...';
    statusColorClass = 'text-amber-500';
    badgeClass = isLightMode
      ? 'bg-amber-50 border-amber-300 text-amber-800'
      : 'bg-amber-950/40 border-amber-500/40 text-amber-300';
    iconColorClass = 'text-amber-400 animate-pulse';
  }

  const formattedTime = lastDataReceivedAt
    ? new Date(lastDataReceivedAt).toLocaleTimeString()
    : 'No data received yet';

  return (
    <div
      className={`rounded-2xl border transition-all text-xs font-mono backdrop-blur-xl ${
        isConnectionStale
          ? isLightMode
            ? 'bg-amber-50/90 border-amber-300 shadow-amber-500/5'
            : 'bg-amber-950/20 border-amber-500/40 shadow-amber-500/5'
          : isLightMode
          ? 'bg-white/90 border-slate-200 shadow-sm'
          : 'bg-slate-900/60 border-slate-800/80 shadow-md'
      }`}
    >
      {/* Header bar / Summary Row */}
      <div className="p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
              connectionMode === 'connected_bt'
                ? 'bg-blue-500/10 border-blue-500/30'
                : connectionMode === 'connected_usb'
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : isConnecting
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-slate-500/10 border-slate-500/20'
            }`}
          >
            <Bluetooth className={`w-4 h-4 ${iconColorClass}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Bluetooth Diagnostics
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                {statusText}
              </span>
            </div>
            {isConnectionStale && (
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Connection may be lost (No signal for {secondsSinceLastData}s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Diagnostic Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Valid Message Counter */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Messages
            </span>
            <span className="text-xs font-black tabular-nums text-cyan-600 dark:text-cyan-400">
              {validMessageCount.toLocaleString()}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Last Update */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Last Update
            </span>
            <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {secondsSinceLastData !== null ? `${secondsSinceLastData}s ago` : 'Waiting'}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {isExpanded ? 'Hide Details' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded Diagnostic Details */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <div
              className={`p-2.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                Bluetooth Status
              </div>
              <div className="font-bold flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : isConnecting ? 'bg-amber-400' : 'bg-slate-400'
                  }`}
                />
                <span className={statusColorClass}>{statusText}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Baud: 9600 &middot; HC-05 (D2 RX / D3 TX)
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                Last Update Time
              </div>
              <div className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>{formattedTime}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {secondsSinceLastData !== null ? `${secondsSinceLastData} seconds elapsed` : 'Awaiting packet'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                Valid Messages Received
              </div>
              <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{validMessageCount} packets verified</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                No packet loss or malformed lines
              </div>
            </div>
          </div>

          {/* Last Raw Message Strip */}
          <div
            className={`p-2 rounded-xl border font-mono text-[11px] flex items-center gap-2 overflow-x-auto ${
              isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-black/60 border-slate-800 text-cyan-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="text-slate-400 shrink-0 font-bold">Last Raw Packet:</span>
            <span className="font-bold truncate select-all">
              {lastRawMessage || 'Awaiting initial telemetry...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
