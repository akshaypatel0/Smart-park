import React from 'react';
import {
  Laptop,
  Usb,
  Bluetooth,
  Keyboard,
  Download,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Maximize2,
  Volume2,
} from 'lucide-react';

interface ChromeOSGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
  isPWAInstalled?: boolean;
}

export const ChromeOSGuideModal: React.FC<ChromeOSGuideModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
  onInstallPWA,
  canInstallPWA = false,
  isPWAInstalled = false,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1, 2, 3', description: 'Select Parking Bay (Lot 1, 2, or 3)', icon: Layers },
    { key: 'Space', description: 'Trigger Hardware Buzzer Test Pulse', icon: Volume2 },
    { key: 'G', description: 'Toggle Gate Barrier (Open / Close)', icon: Layers },
    { key: 'F', description: 'Toggle Fullscreen 3D View', icon: Maximize2 },
    { key: 'U', description: 'Connect Arduino via USB Cable', icon: Usb },
    { key: 'C', description: 'Connect Bluetooth (HC-05)', icon: Bluetooth },
    { key: 'T', description: 'Toggle Light / Dark Theme', icon: Sparkles },
    { key: '?', description: 'Open ChromeOS & Keyboard Guide', icon: Keyboard },
    { key: 'Esc', description: 'Exit Fullscreen or Close Modal', icon: X },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-[#0f172a] border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 border-b ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  ChromeOS & Chromebook Optimization
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for Chromebook labs at શ્રી સરકારી માધ્યમિક શાળા લાખાપર
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full border transition-all active:scale-90 ${
              isLightMode
                ? 'hover:bg-slate-200 text-slate-600 border-slate-300'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* ChromeOS PWA Standby / Shelf Card */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isLightMode
                ? 'bg-sky-50/70 border-sky-200 text-slate-800'
                : 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-bold">
                  {isPWAInstalled ? 'Installed on ChromeOS Shelf' : 'Install to ChromeOS Shelf / Launcher'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Runs as a standalone desktop app on your Chromebook with native window management, full offline caching, and shelf quick-actions.
              </p>
            </div>

            {canInstallPWA && onInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install on Chromebook</span>
              </button>
            )}
          </div>

          {/* ChromeOS Hardware Access Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct USB Web Serial */}
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2 text-cyan-500 dark:text-cyan-400">
                <Usb className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Direct USB (Web Serial)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Plug your Arduino Uno directly into the Chromebook's USB port. Native Web Serial provides 9600-baud two-way communication without installing Arduino IDE or drivers on ChromeOS.
              </p>
            </div>

            {/* Wireless Web Bluetooth */}
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                <Bluetooth className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Web Bluetooth</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Chromebooks natively support Web Bluetooth. Pair wire-free with the HC-05 Arduino module from across the classroom with zero extra software.
              </p>
            </div>
          </div>

          {/* Chromebook Keyboard Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span>Chromebook Physical Keyboard Shortcuts</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Active Anytime</span>
            </div>

            <div
              className={`rounded-2xl border divide-y overflow-hidden ${
                isLightMode
                  ? 'border-slate-200 divide-slate-200 bg-white'
                  : 'border-slate-700/60 divide-slate-800 bg-slate-900/40'
              }`}
            >
              {shortcuts.map((s, idx) => {
                const IconComponent = s.icon;
                return (
                  <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {s.description}
                      </span>
                    </div>
                    <kbd
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border shadow-xs ${
                        isLightMode
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-slate-800 text-cyan-300 border-slate-700'
                      }`}
                    >
                      {s.key}
                    </kbd>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Classroom Tips for ChromeOS */}
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isLightMode
                ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200/90'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <span>💡 Chromebook Lab Demonstration Tip:</span>
            </div>
            <span>
              Use ChromeOS split-screen (<kbd className="font-mono bg-black/20 px-1 rounded">Alt + [</kbd> and <kbd className="font-mono bg-black/20 px-1 rounded">Alt + ]</kbd>) to view this live 3D dashboard on one side and the Arduino Serial Terminal or code on the other!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 sm:p-4 border-t flex items-center justify-between ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <span className="text-[11px] font-mono text-slate-500">
            ChromeOS · Chrome 89+ · Web Serial · Web Bluetooth
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
