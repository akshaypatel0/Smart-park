import React from 'react';
import { SlotData, GateState } from '../types';
import {
  Car,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Wifi,
  Navigation,
  Globe,
  Gauge,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface LiveTrafficDisplayBoardProps {
  slots: SlotData[];
  gateState: GateState;
  isCloudSyncActive: boolean;
  lastDataReceivedAt: number | null;
  isLightMode?: boolean;
}

export const LiveTrafficDisplayBoard: React.FC<LiveTrafficDisplayBoardProps> = ({
  slots,
  gateState,
  isCloudSyncActive,
  lastDataReceivedAt,
  isLightMode = false,
}) => {
  const [secondsAgo, setSecondsAgo] = React.useState<number | null>(null);

  React.useEffect(() => {
    const updateTime = () => {
      if (lastDataReceivedAt) {
        setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastDataReceivedAt) / 1000)));
      } else {
        setSecondsAgo(null);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastDataReceivedAt]);

  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED');
  const occupiedCount = isCloudSyncActive ? occupiedSlots.length : 0;
  const totalSlots = slots.length;
  const vacantCount = Math.max(0, totalSlots - occupiedCount);
  const isFull = vacantCount === 0 && isCloudSyncActive;

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Huge Roadside-Style LED Traffic Banner */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all relative overflow-hidden shadow-xl ${
          !isCloudSyncActive
            ? isLightMode
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 text-amber-200'
            : isFull
            ? isLightMode
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/40 text-rose-200'
            : isLightMode
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-gujarati text-xs sm:text-sm font-bold opacity-80">
                શ્રી સરકારી માધ્યમિક શાળા લાખાપર
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30 font-bold">
                GITHUB PAGES LIVE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-mono">
                {!isCloudSyncActive ? (
                  <span className="text-amber-500 flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 text-amber-500 animate-pulse" />
                    <span>AWAITING GATEWAY</span>
                  </span>
                ) : isFull ? (
                  <span className="text-rose-500 flex items-center gap-2">
                    <XCircle className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 text-rose-500" />
                    <span>PARKING FULL (૦ ખાલી)</span>
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 text-emerald-500 animate-bounce" />
                    <span>{vacantCount} OF {totalSlots} BAYS AVAILABLE</span>
                  </span>
                )}
              </h1>
            </div>

            <p className="text-xs sm:text-sm font-gujarati opacity-90 max-w-xl">
              {!isCloudSyncActive
                ? 'હાર્ડવેર સ્ટેન્ડબાય મોડમાં છે. મુખ્ય મોબાઈલ ફોન (APK) આર્ડ્યુનો સાથે બ્લૂટૂથ કનેક્ટ થશે એટલે લાઈવ ડેટા દેખાશે.'
                : isFull
                ? 'બધા પાર્કિંગ સ્લોટ હાલમાં રોકાયેલા છે. ગેટ આપમેળે બંધ કરવામાં આવ્યો છે.'
                : `અત્યારે ${vacantCount} સ્લોટ ખાલી છે. નીચે દરેક સ્લોટની સ્થિતિ રીઅલ-ટાઇમ જોઈ શકો છો.`}
            </p>
          </div>

          {/* Gateway Status Pill */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-xs ${
                isCloudSyncActive
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isCloudSyncActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
                }`}
              />
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isCloudSyncActive ? 'Gateway: Mobile BT Connected' : 'Gateway: BT Disconnected'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {isCloudSyncActive && secondsAgo !== null
                ? `Sync: ${secondsAgo <= 1 ? 'Just now' : `${secondsAgo}s ago`}`
                : 'Waiting for Bluetooth signal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 High-Visibility Slot Traffic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {slots.map((slot) => {
          const isSlotOccupied = isCloudSyncActive && slot.status === 'OCCUPIED';
          const isSlotEmpty = isCloudSyncActive && (slot.status === 'EMPTY' || slot.status === 'AVAILABLE');

          return (
            <div
              key={slot.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between shadow-md relative overflow-hidden ${
                isSlotOccupied
                  ? isLightMode
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-rose-950/20 border-rose-500/40 text-white'
                  : isSlotEmpty
                  ? isLightMode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-emerald-950/20 border-emerald-500/40 text-white'
                  : isLightMode
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${
                  isSlotOccupied
                    ? 'bg-rose-500'
                    : isSlotEmpty
                    ? 'bg-emerald-500'
                    : 'bg-slate-600'
                }`}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center font-mono font-black text-sm text-cyan-400">
                      0{slot.id}
                    </span>
                    <div>
                      <h3 className="font-mono font-black text-lg tracking-tight">
                        {slot.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-gujarati">
                        અલ્ટ્રાસોનિક સેન્સર બેય
                      </p>
                    </div>
                  </div>

                  {/* Huge Status Pill */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-xs flex items-center gap-1.5 ${
                      isSlotOccupied
                        ? 'bg-rose-600 text-white border-rose-400'
                        : isSlotEmpty
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {isSlotOccupied ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>OCCUPIED</span>
                      </>
                    ) : isSlotEmpty ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>AVAILABLE</span>
                      </>
                    ) : (
                      <span>STANDBY</span>
                    )}
                  </div>
                </div>

                {/* Gujarati Status Heading */}
                <div className="my-2 p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-gujarati font-bold">
                    {isSlotOccupied
                      ? '🚗 વાહન પાર્ક થયેલું છે'
                      : isSlotEmpty
                      ? '🟢 સ્લોટ ખાલી છે (પાર્કિંગ ઉપલબ્ધ)'
                      : '⚪ હાર્ડવેર સિગ્નલની રાહ છે'}
                  </span>
                  {isCloudSyncActive && (
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {slot.distance > 0 ? `${slot.distance.toFixed(1)} cm` : '---'}
                    </span>
                  )}
                </div>

                {/* Occupied Car Info if present */}
                {isSlotOccupied && slot.car && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="opacity-75">Model:</span>
                      <span className="text-slate-200 font-semibold">{slot.car.modelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-75">Plate:</span>
                      <span className="text-cyan-300 font-bold">{slot.car.plate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sensor Proximity Indicator */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span>Proximity:</span>
                </span>
                <span className="font-bold">
                  {isCloudSyncActive && slot.distance > 0
                    ? slot.distance < 10
                      ? '⚠️ Close (<10cm)'
                      : 'Clear (>10cm)'
                    : 'Waiting'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
