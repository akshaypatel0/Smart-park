import React from 'react';
import { Volume2, VolumeX, BellRing } from 'lucide-react';
import { BuzzerState } from '../types';

interface BuzzerIndicatorProps {
  buzzerState: BuzzerState;
  onTriggerPulse: (pulses: 1 | 2 | 3) => void;
  onToggleAudio: () => void;
  isLightMode?: boolean;
}

export const BuzzerIndicator: React.FC<BuzzerIndicatorProps> = ({
  buzzerState,
  onToggleAudio,
  isLightMode = false,
}) => {
  const { active, audioEnabled, hardwareBuzzerOn } = buzzerState;

  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 relative overflow-hidden flex flex-wrap items-center justify-between gap-3 ${
        hardwareBuzzerOn
          ? isLightMode
            ? 'border-amber-400 bg-amber-50/90 shadow-md text-slate-900'
            : 'border-amber-500/50 bg-amber-950/[0.2] shadow-[0_0_25px_rgba(245,158,11,0.2)] text-white'
          : isLightMode
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'glass-panel border-slate-800/80 shadow-md text-white'
      }`}
    >
      {/* Background Pulse when Alarm Active */}
      {(active || hardwareBuzzerOn) && (
        <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none" />
      )}

      {/* Left: Alarm Status */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            active || hardwareBuzzerOn
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_#f59e0b] scale-105'
              : isLightMode
              ? 'bg-slate-100 text-slate-600 border border-slate-200'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <BellRing
            className={`w-5 h-5 ${active || hardwareBuzzerOn ? 'animate-bounce' : ''}`}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight">
              Parking Lot Alarm &amp; Buzzer
            </h3>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                hardwareBuzzerOn
                  ? 'bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-500/60 animate-pulse'
                  : 'bg-slate-500/15 text-slate-500 border-slate-500/30'
              }`}
            >
              {hardwareBuzzerOn ? 'ALERT: PARKING FULL' : 'STANDBY'}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {hardwareBuzzerOn
              ? 'Audible warning active — All 3 parking bays are occupied'
              : 'Automatically sounds alert when all parking bays are taken'}
          </p>
        </div>
      </div>

      {/* Right: Audio Mute Toggle Button */}
      <button
        onClick={onToggleAudio}
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
          audioEnabled
            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40'
            : isLightMode
            ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
        }`}
        title={audioEnabled ? 'Mute app buzzer sounds' : 'Enable app buzzer sounds'}
      >
        {audioEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span>App Audio ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            <span>App Audio MUTED</span>
          </>
        )}
      </button>
    </div>
  );
};
