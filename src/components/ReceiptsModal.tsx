import React from 'react';
import { ParkingReceipt, SlotData } from '../types';
import {
  X,
  Receipt,
  IndianRupee,
  Clock,
  Car,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: ParkingReceipt[];
  slots: SlotData[];
  isLightMode?: boolean;
}

export const ReceiptsModal: React.FC<ReceiptsModalProps> = ({
  isOpen,
  onClose,
  receipts,
  slots,
  isLightMode = false,
}) => {
  if (!isOpen) return null;

  const grandTotal = slots.reduce((acc, s) => acc + (s.totalCollection || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Collection & Payment History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rate: ₹10 / minute · Automatically cut upon vehicle exit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Per-Lot Breakdown Cards */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
            Lot Collection Summary
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {slots.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center"
              >
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                  LOT {s.id}
                </span>
                <span className="text-lg font-mono font-black text-amber-500 dark:text-amber-400 tabular-nums">
                  ₹{s.totalCollection || 0}
                </span>
                <span className="text-[9px] text-slate-500 block truncate">
                  {s.status === 'OCCUPIED' ? '1 Parked' : 'Empty'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Total Revenue Collected:</span>
            </span>
            <span className="text-base font-black">₹{grandTotal}</span>
          </div>
        </div>

        {/* Transaction Receipts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
            Auto-Settled Receipts ({receipts.length})
          </p>

          {receipts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Car className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs font-mono">No departed vehicles yet.</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                When an occupied vehicle leaves any lot, its parking fee is automatically computed at ₹10/min, deducted, and logged here!
              </p>
            </div>
          ) : (
            receipts.slice().reverse().map((r) => {
              const minutes = Math.floor(r.durationSeconds / 60);
              const seconds = r.durationSeconds % 60;
              const durationStr = `${minutes}m ${seconds}s`;

              return (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs">LOT {r.slotId}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {r.plate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{durationStr}</span>
                        </span>
                        <span>·</span>
                        <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      -₹{r.amountPaid.toFixed(2)}
                    </span>
                    <span className="block text-[9px] font-mono text-emerald-500 uppercase font-bold">
                      Auto-Deducted
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
