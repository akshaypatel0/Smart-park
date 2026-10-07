import React from 'react';
import { ConnectionMode, ThemeMode } from '../types';
import {
  Usb,
  Bluetooth,
  Power,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  BellRing,
  Laptop,
  QrCode,
  Radio,
  Sliders,
} from 'lucide-react';

interface HeaderBarProps {
  connectionMode: ConnectionMode;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onConnectUSB: () => void;
  onConnectBluetooth: () => void;
  onDisconnect: () => void;
  onOpenNotificationModal?: () => void;
  onOpenChromeOSGuide?: () => void;
  onOpenQRModal?: () => void;
  portLabel?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isReadOnlyView?: boolean;
  onSwitchToAdmin?: () => void;
  isCloudSyncActive?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  connectionMode,
  theme,
  onToggleTheme,
  onConnectUSB,
  onConnectBluetooth,
  onDisconnect,
  onOpenNotificationModal,
  onOpenChromeOSGuide,
  onOpenQRModal,
  portLabel,
  isFullscreen = false,
  onToggleFullscreen,
  isReadOnlyView = false,
  onSwitchToAdmin,
  isCloudSyncActive = false,
}) => {
  const isConnected = connectionMode === 'connected_usb' || connectionMode === 'connected_bt';
  const isConnecting = connectionMode === 'connecting';
  const isLight = theme === 'light';

  return (
    <header
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        paddingBottom: '12px',
      }}
      className={`w-full border-b px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
          : 'glass-panel border-slate-800/80 text-white'
      }`}
    >
      {/* Zone 1: Clean Brand & School Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <img
          src="/pwa-192x192.png"
          alt="Smart Parking"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-amber-400/50 shadow-md object-cover shrink-0"
        />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-base font-black tracking-tight truncate">
              Smart Parking
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-gujarati font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap shrink-0">
              લાખાપર
            </span>
          </div>
          <span
            className={`text-[10px] sm:text-[11px] font-gujarati font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            શ્રી સરકારી માધ્યમિક શાળા લાખાપર
          </span>
        </div>
      </div>

      {/* Zone 2: System Status Indicator */}
      {isReadOnlyView ? (
        <div
          className={`flex items-center gap-1.5 text-xs font-mono shrink-0 px-2.5 py-1 rounded-xl border transition-all ${
            isLight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="font-bold text-[11px] sm:text-xs">
            LIVE VIEW <span className="hidden sm:inline font-gujarati">(રીડ ઓન્લી ડિસ્પ્લે)</span>
          </span>
        </div>
      ) : (
        <div
          className={`hidden md:flex items-center gap-1.5 text-xs font-mono shrink-0 px-2.5 py-1 rounded-xl border transition-all ${
            connectionMode === 'connected_bt'
              ? isLight
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              : connectionMode === 'connected_usb'
              ? isLight
                ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              : isConnecting
              ? isLight
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : isLight
              ? 'bg-rose-50/60 border-rose-200 text-rose-700'
              : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
          }`}
        >
          <Bluetooth
            className={`w-3.5 h-3.5 shrink-0 ${
              connectionMode === 'connected_bt'
                ? 'text-blue-500 dark:text-cyan-400'
                : connectionMode === 'connected_usb'
                ? 'text-cyan-500'
                : isConnecting
                ? 'text-amber-400 animate-pulse'
                : 'text-rose-500 dark:text-rose-400'
            }`}
          />
          <span className="font-bold text-[11px] sm:text-xs">
            {connectionMode === 'connected_bt'
              ? 'HC-05 Gateway Active'
              : connectionMode === 'connected_usb'
              ? `USB Gateway: ${portLabel || 'Active'}`
              : isConnecting
              ? 'Connecting...'
              : 'Bluetooth Disconnected'}
          </span>
          {isConnected && (
            <span className="hidden lg:inline-flex items-center gap-1 pl-1 text-[10px] text-emerald-400 font-bold border-l border-white/20 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Firebase Live</span>
            </span>
          )}
        </div>
      )}

      {/* Zone 3: Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Read-Only Mode: Show only essential viewing controls */}
        {isReadOnlyView ? (
          <>
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'glass-panel text-amber-300 hover:text-white border-slate-700'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                  isFullscreen
                    ? 'bg-rose-600 text-white border-rose-400'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'glass-panel text-slate-300 hover:text-white border-slate-700'
                }`}
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

          </>
        ) : (
          <>
            {/* Public Live QR Code Button */}
            {onOpenQRModal && (
              <button
                onClick={onOpenQRModal}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center relative shrink-0 ${
                  isLight
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                    : 'glass-panel text-purple-300 hover:text-white border-purple-500/40 hover:bg-purple-900/30'
                }`}
                title="Public Live QR Code: Share link for anyone to view live parking status"
                aria-label="Public Live QR Code"
              >
                <QrCode className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span className="hidden sm:inline-block ml-1 text-[11px] font-mono font-bold">QR</span>
              </button>
            )}

            {/* Notification Settings Button */}
            {onOpenNotificationModal && (
              <button
                onClick={onOpenNotificationModal}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center relative shrink-0 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'glass-panel text-cyan-300 hover:text-white border-slate-700'
                }`}
                title="Notification Alerts"
                aria-label="Notification settings"
              >
                <BellRing className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
              </button>
            )}

            {/* ChromeOS & Keyboard Shortcuts Guide Button */}
            {onOpenChromeOSGuide && (
              <button
                onClick={onOpenChromeOSGuide}
                className={`hidden xs:flex p-1.5 sm:p-2 rounded-xl border transition-colors items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'glass-panel text-cyan-400 hover:text-white border-slate-700'
                }`}
                title="ChromeOS & Chromebook Guide (Keyboard Shortcuts & USB Web Serial)"
                aria-label="ChromeOS Guide"
              >
                <Laptop className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              </button>
            )}

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'glass-panel text-amber-300 hover:text-white border-slate-700'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Fullscreen Toggle (Hidden on mobile phones to save width, available on tablets/desktop) */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`hidden md:flex p-2 rounded-xl border transition-colors items-center justify-center shrink-0 ${
                  isFullscreen
                    ? 'bg-rose-600 text-white border-rose-400'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'glass-panel text-slate-300 hover:text-white border-slate-700'
                }`}
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {/* Primary Connection Action Button */}
            {isConnected ? (
              <button
                onClick={onDisconnect}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                <Power className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Disconnect</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Connect Bluetooth (Primary Wireless Action) */}
                <button
                  onClick={onConnectBluetooth}
                  disabled={isConnecting}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap active:scale-95 shrink-0"
                  title="Connect wirelessly via Bluetooth"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>Connect Bluetooth</span>
                </button>

                {/* Connect USB Cable (Secondary for OTG / PC) */}
                <button
                  onClick={onConnectUSB}
                  disabled={isConnecting}
                  className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono items-center gap-1 transition-all shadow-xs disabled:opacity-50 whitespace-nowrap active:scale-95 shrink-0"
                  title="Connect via USB Cable"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>USB</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};
