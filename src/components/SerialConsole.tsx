import React, { useState, useRef, useEffect } from 'react';
import { ConnectionMode, SerialLogEntry } from '../types';
import {
  Terminal,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  Pause,
  Send,
} from 'lucide-react';

interface SerialConsoleProps {
  logs: SerialLogEntry[];
  connectionMode: ConnectionMode;
  onClearLogs: () => void;
  onSendSerialCommand?: (cmd: string) => void;
  isBrowserSupported: boolean;
  errorMessage?: string | null;
  isLightMode?: boolean;
}

export const SerialConsole: React.FC<SerialConsoleProps> = ({
  logs,
  connectionMode,
  onClearLogs,
  onSendSerialCommand,
  isBrowserSupported,
  errorMessage,
  isLightMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputCmd, setInputCmd] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const copyToClipboard = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.line}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim() || !onSendSerialCommand) return;
    onSendSerialCommand(inputCmd.trim());
    setInputCmd('');
  };

  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isLightMode
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'glass-panel border-slate-800/80 shadow-lg text-white'
      }`}
    >
      {/* Header bar */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isLightMode
                ? 'bg-slate-100 text-cyan-600 border-slate-200'
                : 'bg-slate-800 text-cyan-400 border-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-wide">
                Live Arduino Serial Monitor
              </h4>
              <span className={`text-[11px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                (9600 BAUD)
              </span>
            </div>
            <div
              className={`text-xs mt-0.5 flex items-center gap-2 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>{logs.length} telemetry lines received</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">
                SLOT X | Distance: X.X cm | FSR: XXX | STATUS: XXX
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isLightMode
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : connectionMode === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-400'
              }`}
            />
            <span className="uppercase text-[10px] font-bold">
              {connectionMode === 'connected_usb'
                ? 'USB LIVE'
                : connectionMode === 'connected_bt'
                ? 'BT LIVE'
                : connectionMode === 'connecting'
                ? 'CONNECTING'
                : 'OFFLINE'}
            </span>
          </div>

          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              isLightMode ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console Body */}
      {isOpen && (
        <div
          className={`border-t p-4 space-y-3 ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-[#090d16]/90'
          }`}
        >
          {/* Unsupported Browser Alert banner */}
          {!isBrowserSupported && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Browser Serial Support:</span>{' '}
                Google Chrome or Microsoft Edge on Windows 11/Android is required for USB Serial & Bluetooth.
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div
            className={`flex items-center justify-between text-xs pt-1 ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border ${
                  autoScroll
                    ? isLightMode
                      ? 'bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 text-cyan-300 border-cyan-500/30'
                    : isLightMode
                    ? 'bg-white text-slate-500 border-slate-200'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>Auto-scroll</span>
              </button>

              <button
                onClick={onClearLogs}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Log'}</span>
            </button>
          </div>

          {/* Terminal Output Screen */}
          <div className="w-full h-48 bg-black/90 rounded-xl p-3 font-mono text-xs overflow-y-auto border border-slate-800 space-y-1 text-slate-200">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic h-full flex items-center justify-center">
                Waiting for incoming serial telemetry at 9600 baud...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`break-all ${
                      log.type === 'buzzer'
                        ? 'text-amber-400 font-bold'
                        : log.type === 'system'
                        ? 'text-cyan-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {log.line}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Test Sample Data Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <span className={`text-[10px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Sample Test:
            </span>
            <button
              type="button"
              onClick={() => {
                if (!onSendSerialCommand) return;
                onSendSerialCommand('Lot 1 | Distance: 3.1 cm | Status: EMPTY');
                onSendSerialCommand('Lot 2 | Distance: 2.3 cm | Status: OCCUPIED');
                onSendSerialCommand('Lot 3 | Distance: 4.1 cm | Status: EMPTY');
                onSendSerialCommand('TOTAL OCCUPIED: 1/3 | EMPTY: 2 | UNKNOWN: 0 | AVAILABLE: 2 | GATE: OPEN');
                onSendSerialCommand('-----------------------------------------------------------------------');
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all shadow-xs"
              title="Test with the exact sample data from user prompt"
            >
              ▶ Inject Sample Stream (1/3 Occupied)
            </button>
            <button
              type="button"
              onClick={() => {
                if (!onSendSerialCommand) return;
                onSendSerialCommand('Lot 1 | Distance: 2.1 cm | Status: OCCUPIED');
                onSendSerialCommand('Lot 2 | Distance: 2.3 cm | Status: OCCUPIED');
                onSendSerialCommand('Lot 3 | Distance: 1.9 cm | Status: OCCUPIED');
                onSendSerialCommand('TOTAL OCCUPIED: 3/3 | EMPTY: 0 | UNKNOWN: 0 | AVAILABLE: 0 | GATE: CLOSED');
                onSendSerialCommand('-----------------------------------------------------------------------');
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600/15 hover:bg-rose-600/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all shadow-xs"
              title="Test with all slots occupied (Lot Full, Gate Closed, Buzzer ON)"
            >
              ▶ Inject Full Lot (3/3 Closed)
            </button>
          </div>

          {/* Send / Inject Command Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="Inject line: e.g. Lot 1 | Distance: 3.1 cm | Status: EMPTY"
              className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none transition-colors border ${
                isLightMode
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                  : 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:border-cyan-500'
              }`}
            />
            <button
              type="submit"
              disabled={!inputCmd.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
