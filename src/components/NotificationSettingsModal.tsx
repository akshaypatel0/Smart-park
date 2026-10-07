import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  Car,
  ParkingSquare,
  Sparkles,
} from 'lucide-react';
import {
  notificationService,
  NotificationSettings,
} from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    notificationService.getSettings()
  );
  const [permissionStatus, setPermissionStatus] = useState<boolean>(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      notificationService.checkPermissionStatus().then(setPermissionStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    notificationService.saveSettings(updated);
  };

  const handleRequestPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissionStatus(granted);
    if (granted) {
      notificationService.sendNotification(
        'permission_granted',
        '🔔 Notifications Enabled',
        'Smart Parking alert notifications are now active on your device!',
        'success',
        0
      );
    }
  };

  const handleSendTestNotification = () => {
    notificationService.sendNotification(
      'test_manual_notification',
      '🚗 Smart Parking Alert (Test)',
      'LOT 2 is now OCCUPIED (1/3 occupied · Gate OPEN). Notifications are working smoothly!',
      'info',
      0
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all animate-in fade-in zoom-in-95 duration-200 ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Notification Settings</h3>
              <p className="text-xs text-slate-400 font-mono">
                Useful Alerts · Zero-Spam Throttle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4">
          {/* Permission Status & Request */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              permissionStatus
                ? isLightMode
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isLightMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {permissionStatus ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <div>
                <div className="font-bold">
                  {permissionStatus
                    ? 'Device Notifications Allowed'
                    : 'System Permission Needed'}
                </div>
                <div className={`text-[11px] ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {permissionStatus
                    ? 'Alerts appear in Android notification bar & lockscreen'
                    : 'Tap allow to receive background parking alerts'}
                </div>
              </div>
            </div>

            {!permissionStatus && (
              <button
                onClick={handleRequestPermissions}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs font-mono transition-all"
              >
                Allow
              </button>
            )}
          </div>

          {/* Master Switch */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div>
              <div className="text-sm font-bold">Enable Notifications</div>
              <div className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Receive important parking and gate alert updates
              </div>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Granular Notification Rules */}
          <div className="space-y-2.5 pt-1">
            <span
              className={`text-[11px] font-mono uppercase tracking-wider font-semibold px-1 ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Select What You Want to Be Notified About:
            </span>

            {/* Rule 1: Parking Full Alert */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-semibold">Parking Full Alert</div>
                  <div className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    When all 3 bays become occupied &amp; gate closes
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifyOnFull')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.notifyOnFull ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    settings.notifyOnFull ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Rule 2: Spot Available Alert */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ParkingSquare className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Spot Freed / Available Alert</div>
                  <div className="text-[11px] text-slate-400">
                    When an occupied bay becomes free &amp; available
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifyOnSpotFree')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.notifyOnSpotFree ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    settings.notifyOnSpotFree ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Rule 3: Vehicle Parked */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold">Vehicle Parked Notice</div>
                  <div className="text-[11px] text-slate-400">
                    When a vehicle parks in Lot 1, 2, or 3
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifyOnParked')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.notifyOnParked ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    settings.notifyOnParked ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test & Anti-Spam Guarantee */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">
              🛡️ Anti-Spam: 15s cooldown on repeat states
            </span>

            <button
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{testSent ? 'Notification Sent!' : 'Send Test Alert'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
