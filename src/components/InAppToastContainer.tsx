import React, { useState, useEffect } from 'react';
import {
  InAppToast,
  notificationService,
} from '../services/notificationService';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Bell,
  Car,
  ParkingSquare,
} from 'lucide-react';

interface InAppToastContainerProps {
  isLightMode?: boolean;
}

export const InAppToastContainer: React.FC<InAppToastContainerProps> = ({
  isLightMode = false,
}) => {
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToasts((toast) => {
      setToasts((prev) => [toast, ...prev.slice(0, 3)]); // Keep at most 4 active toasts

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });

    return unsubscribe;
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0"
    >
      {toasts.map((toast) => {
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 flex items-start gap-3 ${
              isLightMode
                ? 'bg-white/95 border-slate-200 text-slate-800'
                : 'bg-slate-900/95 border-slate-700 text-slate-100'
            } ${
              isWarning
                ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : isSuccess
                ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : isError
                ? 'border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                : 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}
          >
            {/* Status Icon */}
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isWarning
                  ? 'bg-amber-500/20 text-amber-400'
                  : isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isError
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isError ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Car className="w-5 h-5" />
              )}
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold font-mono tracking-tight truncate">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Just now</span>
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-300 leading-snug mt-0.5">
                {toast.body}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
