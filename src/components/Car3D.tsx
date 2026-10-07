import React, { useMemo } from 'react';
import { CarVisualConfig } from '../types';

interface Car3DProps {
  car?: CarVisualConfig;
  slotNumber: number;
  currentCharge?: number;
  parkedSince?: number | null;
  isLightMode?: boolean;
}

export const Car3D: React.FC<Car3DProps> = ({
  car,
  slotNumber,
  currentCharge = 0,
  parkedSince,
  isLightMode = false,
}) => {
  const safeCar = useMemo(() => {
    if (car && car.bodyColor) return car;
    if (slotNumber === 1) {
      return {
        bodyColor: '#1e3a8a',
        roofColor: '#172554',
        accentColor: '#38bdf8',
        modelName: 'Executive Sedan',
        plate: 'GJ 12 AK 4589',
        type: 'sedan' as const,
      };
    }
    if (slotNumber === 2) {
      return {
        bodyColor: '#e2e8f0',
        roofColor: '#0f172a',
        accentColor: '#94a3b8',
        modelName: 'Urban Compact SUV',
        plate: 'GJ 12 BP 2024',
        type: 'suv' as const,
      };
    }
    return {
      bodyColor: '#dc2626',
      roofColor: '#991b1b',
      accentColor: '#f87171',
      modelName: 'Sport Coupe',
      plate: 'GJ 12 CR 8831',
      type: 'hatchback' as const,
    };
  }, [car, slotNumber]);

  // Determine vehicle body style
  const bodyType = safeCar.type || (slotNumber === 1 ? 'sedan' : slotNumber === 2 ? 'suv' : 'hatchback');

  // Format parked duration
  const durationText = useMemo(() => {
    if (!parkedSince) return '00:00';
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - parkedSince) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }, [parkedSince, currentCharge]);

  // If already parked for a while, keep static to avoid re-triggering entrance animation on polling
  const isNewlyArrived = parkedSince && Date.now() - parkedSince < 800;

  return (
    <div
      className="relative w-24 h-40 select-none preserve-3d"
      style={{
        animation: isNewlyArrived ? 'carEnter 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
        transform: 'translateY(0px)',
      }}
    >
      {/* LIVE BILLING HUD TAG FLOATING DIRECTLY ABOVE CAR */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap flex flex-col items-center animate-fade-in"
        style={{ transform: 'translateZ(45px)' }}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 text-white border border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.5)] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-black text-emerald-400 tabular-nums">
            ₹{currentCharge.toFixed(2)}
          </span>
          <span className="text-[9px] font-mono text-slate-300 border-l border-white/20 pl-1.5 tabular-nums">
            {durationText}
          </span>
        </div>
        {/* Pointer triangle */}
        <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950/90" />
      </div>

      {/* Realistic Headlight Road Illumination Beams */}
      <div
        className="absolute -top-16 inset-x-0 h-20 pointer-events-none opacity-60 blur-xs"
        style={{
          background: 'linear-gradient(to top, rgba(254, 240, 138, 0.7) 0%, rgba(254, 240, 138, 0.25) 45%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)',
          transform: 'translateZ(1px)',
        }}
      />

      {/* Realistic Multi-Layer Asphalt Contact Shadow */}
      <div
        className={`absolute inset-x-1 -bottom-3 h-40 rounded-3xl blur-md pointer-events-none ${
          isLightMode ? 'bg-black/55' : 'bg-black/90'
        }`}
        style={{ transform: 'translateZ(-2px) scale(0.98)' }}
      />
      <div
        className="absolute inset-x-2 -bottom-1 h-38 rounded-2xl bg-black/80 blur-xs pointer-events-none"
        style={{ transform: 'translateZ(-1px)' }}
      />

      {/* 4 REALISTIC ALLOY WHEELS WITH RUBBER TIRES & SILVER RIMS */}
      {/* Front Left Wheel */}
      <div
        className="absolute top-6 -left-2.5 w-3 h-8 rounded-md bg-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{ transform: 'translateZ(3px)' }}
      >
        <div className="w-1.5 h-6 rounded-sm bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border border-slate-600" />
        <div className="absolute w-1 h-1 rounded-full bg-red-600" />
      </div>
      {/* Front Right Wheel */}
      <div
        className="absolute top-6 -right-2.5 w-3 h-8 rounded-md bg-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{ transform: 'translateZ(3px)' }}
      >
        <div className="w-1.5 h-6 rounded-sm bg-gradient-to-l from-slate-400 via-slate-200 to-slate-400 border border-slate-600" />
        <div className="absolute w-1 h-1 rounded-full bg-red-600" />
      </div>
      {/* Rear Left Wheel */}
      <div
        className="absolute bottom-6 -left-2.5 w-3 h-8 rounded-md bg-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{ transform: 'translateZ(3px)' }}
      >
        <div className="w-1.5 h-6 rounded-sm bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border border-slate-600" />
        <div className="absolute w-1 h-1 rounded-full bg-red-600" />
      </div>
      {/* Rear Right Wheel */}
      <div
        className="absolute bottom-6 -right-2.5 w-3 h-8 rounded-md bg-neutral-950 border border-neutral-700 shadow-md flex items-center justify-center overflow-hidden"
        style={{ transform: 'translateZ(3px)' }}
      >
        <div className="w-1.5 h-6 rounded-sm bg-gradient-to-l from-slate-400 via-slate-200 to-slate-400 border border-slate-600" />
        <div className="absolute w-1 h-1 rounded-full bg-red-600" />
      </div>

      {/* MAIN CAR CHASSIS & AERODYNAMIC BODY */}
      <div
        className="absolute inset-0 rounded-2xl preserve-3d border transition-all duration-300"
        style={{
          background: `linear-gradient(175deg, ${safeCar.bodyColor} 0%, ${safeCar.roofColor} 60%, ${safeCar.accentColor} 100%)`,
          borderColor: isLightMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
          boxShadow: isLightMode
            ? '0 12px 24px -4px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)'
            : '0 16px 30px -4px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.6)',
          transform: 'translateZ(7px)',
        }}
      >
        {/* Metallic Specular Reflection Highlight Across Hood */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 bg-gradient-to-b from-white/60 via-transparent to-black/30"
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* FRONT BUMPER & RADIATOR GRILLE */}
        <div className="absolute top-0 inset-x-3 h-3 rounded-b-md bg-neutral-950 border-x border-b border-neutral-700 flex items-center justify-center shadow-inner">
          <div className="w-3/4 h-1 rounded-full bg-neutral-800 flex justify-around items-center px-0.5">
            <div className="w-1 h-0.5 bg-neutral-600 rounded-full" />
            <div className="w-1 h-0.5 bg-neutral-600 rounded-full" />
            <div className="w-1 h-0.5 bg-neutral-600 rounded-full" />
          </div>
        </div>

        {/* HIGH-PRECISION DUAL PROJECTOR LED HEADLIGHTS + DRL HALOS */}
        <div className="absolute top-1.5 inset-x-1.5 flex justify-between items-center px-0.5 z-20">
          {/* Left Headlight */}
          <div className="w-4 h-2.5 rounded-sm bg-sky-100 border border-sky-300 shadow-[0_0_12px_#fef08a] flex items-center justify-around px-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
            <div className="w-1 h-1 rounded-full bg-amber-400" />
          </div>
          {/* Right Headlight */}
          <div className="w-4 h-2.5 rounded-sm bg-sky-100 border border-sky-300 shadow-[0_0_12px_#fef08a] flex items-center justify-around px-0.5">
            <div className="w-1 h-1 rounded-full bg-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          </div>
        </div>

        {/* SCULPTURED FRONT HOOD WITH AERODYNAMIC POWER CREASES */}
        <div className="absolute top-3 inset-x-3 h-9 rounded-t-lg bg-black/10 flex items-center justify-between px-1">
          <div className="w-0.5 h-7 bg-white/20 rounded-full" />
          {/* Brand Logo Hood Emblem */}
          <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-slate-300 to-white shadow-xs border border-slate-400" />
          <div className="w-0.5 h-7 bg-white/20 rounded-full" />
        </div>

        {/* AERODYNAMIC SIDE MIRRORS WITH AMBER TURN INDICATORS */}
        <div
          className="absolute top-12 -left-2 w-2 h-3 rounded-l-md bg-neutral-900 border-l border-t border-slate-400 shadow-md flex flex-col justify-between p-0.5"
          style={{ transform: 'translateZ(10px)' }}
        >
          <div className="w-0.5 h-1 bg-amber-400 rounded-full" />
        </div>
        <div
          className="absolute top-12 -right-2 w-2 h-3 rounded-r-md bg-neutral-900 border-r border-t border-slate-400 shadow-md flex flex-col justify-between p-0.5"
          style={{ transform: 'translateZ(10px)' }}
        >
          <div className="w-0.5 h-1 bg-amber-400 rounded-full" />
        </div>

        {/* CABIN GREENHOUSE (WINDSHIELD, ROOF, REAR WINDOW) */}
        <div
          className="absolute top-11 inset-x-2.5 h-20 rounded-xl preserve-3d overflow-hidden border border-slate-700/80 shadow-md"
          style={{
            background: 'linear-gradient(180deg, #0b1120 0%, #1e293b 100%)',
            transform: 'translateZ(10px)',
          }}
        >
          {/* Windshield Glass Reflection Diagonal Sheen */}
          <div
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-cyan-100/30 to-transparent pointer-events-none"
            style={{ transform: 'rotate(-25deg) translateY(-20%)' }}
          />

          {/* Windshield Wiper Accents */}
          <div className="absolute top-1 left-2 w-6 h-0.5 bg-black/60 rounded-full -rotate-6" />
          <div className="absolute top-1 right-2 w-6 h-0.5 bg-black/60 rounded-full 6" />

          {/* SOLID METALLIC ROOF WITH PANORAMIC GLASS SUNROOF */}
          <div
            className="absolute top-3.5 inset-x-1.5 h-12 rounded-lg border border-white/20 flex flex-col items-center justify-between p-1 shadow-inner"
            style={{
              background: `linear-gradient(180deg, ${safeCar.roofColor} 0%, ${safeCar.bodyColor} 100%)`,
              transform: 'translateZ(3px)',
            }}
          >
            {/* Panoramic Tinted Sunroof */}
            <div className="w-full h-5 rounded bg-black/70 border border-cyan-400/30 flex items-center justify-center shadow-inner">
              <span className="text-[7px] font-mono text-cyan-200 font-bold opacity-80">
                LOT {slotNumber}
              </span>
            </div>

            {/* Rear Roof Shark-Fin Antenna */}
            <div className="w-1 h-2 rounded-t-full bg-neutral-900 border-x border-slate-400 shadow-xs" />
          </div>

          {/* Rear Window Defroster Lines */}
          <div className="absolute bottom-1 inset-x-2 h-2 flex flex-col justify-around opacity-30 pointer-events-none">
            <div className="w-full h-px bg-amber-500" />
            <div className="w-full h-px bg-amber-500" />
          </div>
        </div>

        {/* REAR TRUNK & AUTHENTIC STATE LICENSE NUMBER PLATE */}
        <div className="absolute bottom-2.5 inset-x-2.5 h-4 flex items-center justify-center">
          <div className="px-1.5 py-0.5 rounded-[2px] bg-white border border-slate-400 shadow-md flex items-center gap-0.5">
            {/* Blue IND Strip */}
            <div className="w-1.5 h-2 rounded-[1px] bg-blue-700 flex flex-col items-center justify-center">
              <span className="text-[3px] text-white font-bold leading-none">IND</span>
            </div>
            {/* Registration Number */}
            <span className="text-[7px] font-mono text-slate-950 font-black tracking-tight leading-none">
              {safeCar.plate}
            </span>
          </div>
        </div>

        {/* FULL-WIDTH MODERN LED REAR LIGHTBAR */}
        <div className="absolute bottom-1 inset-x-1.5 h-1.5 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-between px-1 z-20">
          <div className="w-3 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
          <div className="w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_6px_#ef4444]" />
          <div className="w-3 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444]" />
        </div>

        {/* REAR DUAL EXHAUST TIPS & AERODYNAMIC DIFFUSER */}
        <div className="absolute -bottom-1 inset-x-4 h-1 bg-neutral-900 rounded-b flex items-center justify-between px-1">
          <div className="w-1.5 h-1 rounded-full bg-slate-300 border border-slate-500" />
          <div className="w-1.5 h-1 rounded-full bg-slate-300 border border-slate-500" />
        </div>
      </div>
    </div>
  );
};
