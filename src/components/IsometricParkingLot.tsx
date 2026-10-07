import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CameraView, SlotData, GateState } from '../types';
import { Car3D } from './Car3D';
import {
  Compass,
  Eye,
  Maximize2,
  Sparkles,
  Radio,
  IndianRupee,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
} from 'lucide-react';

interface IsometricParkingLotProps {
  slots: SlotData[];
  gateState: GateState;
  hardwareBuzzerOn: boolean;
  onSlotClick?: (slotId: number) => void;
  selectedSlotId?: number;
  isLightMode?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: (fullscreen: boolean) => void;
  isConnected?: boolean;
  isReadOnlyView?: boolean;
  isCloudSyncActive?: boolean;
}

export const IsometricParkingLot: React.FC<IsometricParkingLotProps> = ({
  slots,
  gateState,
  hardwareBuzzerOn,
  onSlotClick,
  selectedSlotId,
  isLightMode = false,
  isFullscreen = false,
  onToggleFullscreen,
  isConnected = false,
  isReadOnlyView = false,
  isCloudSyncActive = false,
}) => {
  const [cameraView, setCameraView] = useState<CameraView>('isometric');
  const [showSensorRays, setShowSensorRays] = useState(true);
  const [manualZoomMultiplier, setManualZoomMultiplier] = useState(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 700, height: 480 });

  // Measure stage element continuously using ResizeObserver to guarantee auto-fit on ANY screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateBounds = (width: number, height: number) => {
      if (width > 0 && height > 0) {
        setStageDimensions({ width, height });
      }
    };

    // Initial measurement
    updateBounds(el.clientWidth, el.clientHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        updateBounds(width, height);
      }
    });

    observer.observe(el);

    const handleWindowResize = () => {
      if (el) updateBounds(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, [isFullscreen]);

  // Reset zoom multiplier when camera view or fullscreen changes
  useEffect(() => {
    setManualZoomMultiplier(1.0);
  }, [cameraView, isFullscreen]);

  const isGateClosed = gateState.angle >= 45 || gateState.status === 'CLOSED';
  const isLiveActive = isConnected || isCloudSyncActive || isReadOnlyView;
  const totalOccupied = isLiveActive ? slots.filter((s) => s.status === 'OCCUPIED').length : 0;
  const isAllFull = isLiveActive && totalOccupied >= slots.length;

  /**
   * MATHEMATICAL AUTO-FIT SCALING ENGINE:
   * Base dimensions of the 3D parking yard: 520px wide × 360px high.
   * We calculate the true 2D projected bounding box for each camera perspective,
   * then fit BOTH width AND height into available viewport space with zero cut-off.
   */
  const autoFitScale = useMemo(() => {
    let safeProjectedWidth = 620;
    let safeProjectedHeight = 410;

    if (cameraView === 'topdown') {
      safeProjectedWidth = 530;
      safeProjectedHeight = 370;
    } else if (cameraView === 'driver') {
      safeProjectedWidth = 580;
      safeProjectedHeight = 400;
    }

    // Usable stage space with safe clearance margins
    const availableWidth = Math.max(180, stageDimensions.width - 20);
    const availableHeight = Math.max(220, stageDimensions.height > 50 ? stageDimensions.height - 16 : 320);

    const scaleFactorX = availableWidth / safeProjectedWidth;
    const scaleFactorY = availableHeight / safeProjectedHeight;

    // Constrain to the tighter axis so it NEVER clips or cuts off
    const fitScale = Math.min(scaleFactorX, scaleFactorY);

    // Floor at 0.40 for narrow mobile screens; allows up to 1.70 on large monitors
    return Math.max(0.4, Math.min(1.7, fitScale));
  }, [stageDimensions, cameraView]);

  // Combined scale incorporating user manual zoom
  const currentScale = useMemo(() => {
    return Number((autoFitScale * manualZoomMultiplier).toFixed(3));
  }, [autoFitScale, manualZoomMultiplier]);

  const handleZoomIn = useCallback(() => {
    setManualZoomMultiplier((prev) => Math.min(1.8, Number((prev + 0.15).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setManualZoomMultiplier((prev) => Math.max(0.65, Number((prev - 0.15).toFixed(2))));
  }, []);

  const handleResetZoom = useCallback(() => {
    setManualZoomMultiplier(1.0);
  }, []);

  // Camera 3D angles
  const cameraTransform = useMemo(() => {
    switch (cameraView) {
      case 'topdown':
        return 'rotateX(0deg) rotateZ(0deg)';
      case 'driver':
        return 'rotateX(58deg) rotateZ(-10deg)';
      case 'isometric':
      default:
        return 'rotateX(46deg) rotateZ(-22deg)';
    }
  }, [cameraView]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 flex flex-col items-center justify-start select-none ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none shadow-none pt-[max(0.6rem,env(safe-area-inset-top,16px))] pb-2 px-2 sm:px-4'
          : 'h-auto min-h-[350px] sm:min-h-[420px] rounded-3xl border shadow-xl p-2.5 sm:p-4'
      } ${
        isLightMode
          ? 'bg-gradient-to-b from-slate-100 via-sky-50/60 to-slate-200 border-slate-300 shadow-slate-300/40'
          : 'bg-gradient-to-b from-[#0b0f19] via-[#080c14] to-[#04070d] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
      }`}
    >
      {/* Background Architectural Subtle Grid */}
      <div
        className={`absolute inset-0 pointer-events-none bg-[size:28px_28px] ${
          isLightMode
            ? 'bg-[linear-gradient(to_right,#00000007_1px,transparent_1px),linear-gradient(to_bottom,#00000007_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,#38bdf806_1px,transparent_1px),linear-gradient(to_bottom,#38bdf806_1px,transparent_1px)]'
        }`}
      />

      {/* TOP MINIMALIST CONTROL BAR */}
      <div
        className={`${
          isFullscreen
            ? 'w-full z-30 pt-1 pb-2 px-1 sm:px-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 rounded-2xl'
            : 'w-full z-30'
        } flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-auto`}
      >
        {/* Left: Minimalist Status Pill with Stacked Title & Standby */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <div
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl flex items-center gap-2 border shadow-xs backdrop-blur-md transition-all shrink-0 ${
              isLightMode && !isFullscreen
                ? 'bg-white/95 text-slate-800 border-slate-300 shadow-slate-200'
                : 'glass-panel text-slate-200 border-slate-700/80 shadow-black/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isLiveActive
                  ? isAllFull
                    ? 'bg-rose-500 animate-ping'
                    : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'
                  : 'bg-slate-400'
              }`}
            />
            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="font-bold tracking-tight text-xs sm:text-sm whitespace-nowrap text-slate-900 dark:text-white">
                Lakhapar Parking Area
              </span>
              <span
                className={`text-[10px] font-mono font-semibold tabular-nums ${
                  isLiveActive
                    ? isAllFull
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-cyan-600 dark:text-cyan-300'
                }`}
              >
                {isLiveActive ? (isAllFull ? '3/3 Occupied' : `${totalOccupied}/3 Occupied`) : 'Standby / Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Camera Switcher, Auto-Fit/Zoom, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Camera View Switcher (3D and Top) */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-full border shadow-xs backdrop-blur-md shrink-0 ${
              isLightMode && !isFullscreen ? 'bg-white/95 border-slate-300' : 'glass-panel border-slate-700/80'
            }`}
          >
            <button
              onClick={() => setCameraView('isometric')}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                cameraView === 'isometric'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Isometric 3D View"
            >
              <Compass className="w-3 h-3" />
              <span>3D</span>
            </button>

            <button
              onClick={() => setCameraView('topdown')}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                cameraView === 'topdown'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Top Blueprint View"
            >
              <Eye className="w-3 h-3" />
              <span>Top</span>
            </button>

            <button
              onClick={() => setCameraView('driver')}
              className={`hidden md:flex px-2 py-1 text-xs font-medium rounded-full transition-all items-center gap-1 ${
                cameraView === 'driver'
                  ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Driver Street View"
            >
              <Navigation className="w-3 h-3" />
              <span>Street</span>
            </button>
          </div>

          {/* Interactive Zoom Controls & Auto-Fit (Visible on larger screens or compact) */}
          <div
            className={`hidden sm:flex items-center gap-0.5 p-0.5 rounded-full border shadow-xs backdrop-blur-md shrink-0 ${
              isLightMode && !isFullscreen ? 'bg-white/95 border-slate-300' : 'glass-panel border-slate-700/80'
            }`}
          >
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200 active:scale-90 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetZoom}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full transition-all ${
                manualZoomMultiplier !== 1.0
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Reset Auto-Fit to Display"
            >
              {manualZoomMultiplier === 1.0 ? 'Fit' : `${Math.round(manualZoomMultiplier * 100)}%`}
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200 active:scale-90 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ultrasonic Sensor Beam Toggle */}
          <button
            onClick={() => setShowSensorRays((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-colors shrink-0 ${
              showSensorRays
                ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
            title="Toggle Sensor Beams"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen / Maximize Toggle (Guaranteed Never Cut Off) */}
          <button
            onClick={() => onToggleFullscreen && onToggleFullscreen(!isFullscreen)}
            className={`p-1.5 sm:p-2 rounded-full border transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 ${
              isFullscreen
                ? 'bg-rose-600 text-white border-rose-400 hover:bg-rose-500'
                : isLightMode
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border-cyan-500/40'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D PARKING YARD SCENE CONTAINER - UPPER ALIGNED & RESIZES TO FIT */}
      <div
        ref={stageRef}
        className={`w-full flex items-center justify-center overflow-visible perspective-1600 select-none relative pt-1 sm:pt-2 pb-2 ${
          isFullscreen
            ? 'flex-1 mt-2 sm:mt-4 min-h-[360px]'
            : 'mt-1 sm:mt-2 h-[290px] xs:h-[320px] sm:h-[370px] md:h-[420px]'
        }`}
      >
        <div
          className="parking-scene preserve-3d transition-transform duration-500 ease-out origin-center"
          style={{
            transform: `${cameraTransform} scale(${currentScale})`,
          }}
        >
          {/* ARCHITECTURAL PLATFORM FOUNDATION (520px x 360px) */}
          <div
            className="relative w-[520px] rounded-3xl border-2 preserve-3d flex flex-col items-center shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              background: isLightMode
                ? 'linear-gradient(180deg, #475569 0%, #334155 100%)'
                : 'linear-gradient(180deg, #182232 0%, #0d1420 100%)',
              borderColor: isLightMode ? '#94a3b8' : '#334155',
              boxShadow: isLightMode
                ? '0 30px 60px -15px rgba(51, 65, 85, 0.45), inset 0 2px 4px rgba(255,255,255,0.4)'
                : '0 35px 70px -15px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255,255,255,0.08)',
              transform: 'translateZ(0px)',
            }}
          >
            {/* 1. TOP MARQUEE: ONLY "Lakhapar Parking Area" IN ENGLISH AND GUJARATI */}
            <div
              className={`w-full py-2.5 px-6 border-b flex items-center justify-between ${
                isLightMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-black/85 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#38bdf8]" />
                <div className="flex flex-col">
                  <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-sans leading-tight">
                    Lakhapar Parking Area
                  </h2>
                  <span className="text-xs sm:text-sm font-gujarati font-bold text-amber-300 tracking-wide leading-tight">
                    લાખાપર પાર્કિંગ વિસ્તાર
                  </span>
                </div>
              </div>

              {/* Minimalist Live Status Indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  {isLiveActive ? (isAllFull ? 'FULL' : 'ACTIVE') : 'STANDBY'}
                </span>
              </div>
            </div>

            {/* 2. THE 3 PARKING BAYS WITH LANDSCAPED GRASS MEDIANS */}
            <div className="w-full px-5 py-3 flex items-center justify-between gap-3 preserve-3d">
              {slots.map((slot, index) => {
                const explicitOccupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;
                const isSlotExplicitOccupied = slot.status === 'OCCUPIED';
                const isSlotImplicitOccupied =
                  explicitOccupiedCount === 0 && totalOccupied > 0 && index < totalOccupied;
                const isOccupied = isLiveActive && (isSlotExplicitOccupied || isSlotImplicitOccupied);
                const isEmpty = isLiveActive && !isOccupied && (slot.status === 'EMPTY' || slot.status === 'AVAILABLE' || index >= totalOccupied);
                const isSelected = selectedSlotId === slot.id;

                return (
                  <React.Fragment key={slot.id}>
                    {/* Landscaped Green Grass Median Between Bays */}
                    {index > 0 && (
                      <div
                        className="flex-none w-3.5 h-56 rounded-xl border border-slate-500/40 bg-slate-800/80 p-0.5 shadow-sm flex flex-col items-center justify-between py-2 preserve-3d"
                        style={{ transform: 'translateZ(3px)' }}
                        title="Landscaped Grass Divider"
                      >
                        <div className="w-full h-full rounded-lg grass-divider-texture flex flex-col items-center justify-between py-2 shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-300 shadow-xs" />
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-300 shadow-xs" />
                        </div>
                      </div>
                    )}

                    {/* PARKING BAY STALL */}
                    <div
                      onClick={() => onSlotClick && onSlotClick(slot.id)}
                      className={`relative flex-1 h-56 rounded-2xl border-2 p-2 flex flex-col items-center justify-between transition-all duration-300 cursor-pointer preserve-3d ${
                        isOccupied
                          ? 'border-rose-500/90 bg-rose-950/25 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                          : isEmpty
                          ? 'border-emerald-500/90 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                          : isLightMode
                          ? 'border-slate-400/80 bg-slate-800/30'
                          : 'border-slate-700 bg-slate-900/40'
                      } ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-[1.01]'
                          : ''
                      }`}
                    >
                      {/* Top Bay Header: Slot ID & Minimalist Ultrasonic Sensor */}
                      <div className="w-full flex items-center justify-between z-20">
                        <span className="text-xs font-mono font-black text-white bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                          LOT {slot.id}
                        </span>

                        {/* Minimalist Smart Ultrasonic Sensor Status Light */}
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                              isOccupied
                                ? 'bg-rose-500 border-rose-200 shadow-[0_0_12px_#f43f5e]'
                                : isEmpty
                                ? 'bg-emerald-500 border-emerald-200 shadow-[0_0_12px_#10b981]'
                                : 'bg-slate-500 border-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Optical Sonar Ray Beaming Down */}
                      {showSensorRays && (
                        <div
                          className={`w-0.5 h-12 pointer-events-none transition-all duration-500 absolute top-7 left-1/2 -translate-x-1/2 ${
                            isOccupied
                              ? 'bg-gradient-to-b from-rose-500 to-transparent'
                              : isEmpty
                              ? 'bg-gradient-to-b from-emerald-500 to-transparent'
                              : 'bg-gradient-to-b from-slate-400 to-transparent'
                          }`}
                        />
                      )}

                      {/* Central Vehicle Area: 3D Car or Clean Minimalist Empty Stall */}
                      <div className="relative w-full flex-1 flex items-center justify-center my-0.5 preserve-3d">
                        {isOccupied ? (
                          <Car3D
                            car={slot.car}
                            slotNumber={slot.id}
                            currentCharge={slot.currentCharge}
                            parkedSince={slot.parkedSince}
                            isLightMode={isLightMode}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                            <div
                              className={`w-12 h-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center ${
                                isEmpty
                                  ? 'border-emerald-400/80 bg-emerald-500/10'
                                  : 'border-slate-500/60 bg-slate-500/10'
                              }`}
                            >
                              <span
                                className={`text-xl font-mono font-black ${
                                  isEmpty ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                0{slot.id}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-mono tracking-widest font-bold uppercase ${
                                isEmpty ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {isEmpty ? 'EMPTY' : 'STANDBY'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rubber Wheel Stop Curb */}
                      <div
                        className="w-18 h-1.5 rounded-xs bg-neutral-950 border border-slate-600 shadow-md mb-1 z-20 rumble-strip"
                        style={{ transform: 'translateZ(3px)' }}
                      />

                      {/* Bottom Live Telemetry & Charge Badge */}
                      <div className="w-full flex items-center justify-between px-2 py-0.5 text-[9px] font-mono text-slate-200 bg-black/85 rounded-lg border border-white/10 z-20">
                        <span className="tabular-nums flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-cyan-400" />
                          {(slot.hasHardwareReading || isLiveActive) && slot.status !== 'UNKNOWN'
                            ? `${slot.distance.toFixed(1)} ${slot.unit || 'cm'}`
                            : '--.- cm'}
                        </span>
                        {isOccupied ? (
                          <span className="tabular-nums font-black text-emerald-400 animate-pulse">
                            ₹{(slot.currentCharge || 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-400">FREE</span>
                        )}
                      </div>

                      {/* White Stop Bar Strip At Bay Exit */}
                      <div className="absolute -bottom-1 inset-x-2 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff] z-30" />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* 3. CIRCULATION DRIVEWAY WITH WHITE ROAD STRIPES */}
            <div
              className={`w-full py-2 px-6 border-t-2 border-b-2 flex items-center justify-between relative overflow-hidden ${
                isLightMode ? 'bg-slate-700 border-white/60' : 'bg-[#101724] border-white/40'
              }`}
            >
              {/* Center dashed white road stripes */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-1 white-road-stripes opacity-90 shadow-[0_0_4px_#ffffff] pointer-events-none" />

              {/* Bay Directional Guide Arrows */}
              <div className="flex items-center gap-6 z-10">
                <div className="flex items-center gap-1 text-white font-mono text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 1</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 2</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span className="text-yellow-400 text-xs">⬆</span>
                  <span>BAY 3</span>
                </div>
              </div>

              {/* Drive Aisle Speed & Direction */}
              <div className="flex items-center gap-2 z-10">
                <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shadow-xs">
                  <span className="text-black font-black text-[8px] font-sans">10</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded-md border border-white/20">
                  <span>ONE-WAY</span>
                  <span className="text-yellow-400 text-xs">➔</span>
                </div>
              </div>
            </div>

            {/* 4. ENTRANCE GATE & MG995 BOOM BARRIER */}
            <div
              className={`w-full py-2 px-6 flex items-center justify-between relative overflow-hidden ${
                isLightMode ? 'bg-slate-800' : 'bg-black/90'
              }`}
            >
              {/* White lane divider */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 white-road-stripes opacity-60 pointer-events-none" />

              {/* Barrier Gate & Servo Mechanism */}
              <div className="flex items-center gap-3 z-10">
                {/* Security Gate Tower */}
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-600 shadow-md flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>

                {/* Servo Actuator */}
                <div className="relative w-5 h-7 rounded-md bg-amber-500 border border-neutral-900 shadow-md flex flex-col items-center justify-between py-1">
                  <span className="text-[5px] font-mono font-black text-black">MG995</span>
                  <div
                    className={`w-2 h-2 rounded-full border border-white ${
                      isGateClosed
                        ? 'bg-red-600 shadow-[0_0_6px_#ef4444]'
                        : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                    }`}
                  />
                </div>

                {/* Boom Barrier Arm */}
                <div className="relative w-24 h-2 bg-white rounded-r border border-slate-700 shadow-md overflow-hidden curb-hazard transition-all duration-500">
                  <div
                    className={`absolute inset-0 bg-red-600/40 transition-opacity duration-300 ${
                      isGateClosed ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                    isGateClosed
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  GATE: {isGateClosed ? 'CLOSED' : 'OPEN'}
                </span>
              </div>

              {/* Pedestrian Zebra Crosswalk Strips */}
              <div
                className="w-14 h-5 white-crosswalk-stripes opacity-90 rounded-xs border-x border-white/40 z-10 shadow-xs hidden sm:block"
                title="Pedestrian Crosswalk"
              />

              {/* Clean Status */}
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 z-10">
                <span className="text-emerald-400 font-bold text-[10px]">ENTRY / EXIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
