import React, { useState } from 'react';
import {
  Bell,
  Bluetooth,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface PermissionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const PermissionPromptModal: React.FC<PermissionPromptModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [grantedDetails, setGrantedDetails] = useState({
    notifications: false,
    storage: false,
    bluetooth: false,
  });

  if (!isOpen) return null;

  const handleGrantPermissions = async () => {
    setIsProcessing(true);
    const details = { notifications: false, storage: false, bluetooth: false };

    // 1. Request Notification Permission
    try {
      const notifGranted = await notificationService.requestPermissions();
      details.notifications = notifGranted;
    } catch {
      details.notifications = false;
    }

    // 2. Request Persistent Storage for 100% Offline reliability
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersisted = await navigator.storage.persist();
        details.storage = isPersisted;
      } else {
        details.storage = true;
      }
    } catch {
      details.storage = true;
    }

    // 3. Mark Bluetooth readiness
    details.bluetooth = true;

    setGrantedDetails(details);

    // Save flag so user is not prompted again
    try {
      localStorage.setItem('smartparking_permissions_granted', 'true');
    } catch {}

    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('smartparking_permissions_granted', 'skipped');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-5 sm:p-7 border shadow-2xl transition-all duration-300 ${
          isLightMode
            ? 'bg-white text-slate-900 border-slate-200'
            : 'glass-panel-elevated text-white border-slate-700/80'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
          aria-label="Skip permissions"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div
          className={`flex items-center gap-3.5 pb-4 border-b ${
            isLightMode ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <img
            src="/pwa-192x192.png"
            alt="Smart Parking Logo"
            className="w-12 h-12 rounded-2xl shadow-lg border border-amber-400/50 object-cover shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">
                Welcome to Smart Parking
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                લાખાપર
              </span>
            </div>
            <p className={`text-xs font-mono mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              શ્રી સરકારી માધ્યમિક શાળા લાખાપર
            </p>
          </div>
        </div>

        {/* Body Message */}
        <div className="mt-4 space-y-3.5 text-xs">
          <p className={`${isLightMode ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
            To give you the best experience with real-time parking telemetry, instant arrival alerts, and 100% offline access, please enable these essential permissions:
          </p>

          {/* Permission Item 1: Notifications */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Notifications &amp; Alerts</span>
                {grantedDetails.notifications && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Useful alerts when Parking becomes FULL or when a bay is FREED. Never spam.
              </p>
            </div>
          </div>

          {/* Permission Item 2: Bluetooth & Hardware */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Bluetooth &amp; Nearby Hardware</span>
                {grantedDetails.bluetooth && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Discovers and pairs with Arduino Uno wirelessly via HC-05 Bluetooth module.
              </p>
            </div>
          </div>

          {/* Permission Item 3: Offline Storage */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
              isLightMode
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Persistent Offline Storage</span>
                {grantedDetails.storage && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Saves app graphics and sensor data locally so the app runs offline without internet.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleGrantPermissions}
            disabled={isProcessing}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Configuring Permissions...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Allow &amp; Enable Permissions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className={`w-full sm:w-auto py-3 px-4 rounded-2xl border text-xs font-mono transition-colors ${
              isLightMode
                ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
