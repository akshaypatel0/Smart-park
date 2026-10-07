import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Wifi,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Smartphone,
  Play,
  Activity,
  Cpu,
  Usb,
  ShieldCheck,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  KeyRound,
  Radio,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { hc05Bluetooth, DiscoveredBluetoothDevice } from '../services/webBluetooth';
import { ConnectionMode } from '../types';
import { downloadArduinoInoFile } from '../utils/downloadFirmware';

interface BluetoothConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionMode: ConnectionMode;
  portLabel?: string;
  onConnectBluetooth: (deviceId?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onConnectUSB: () => Promise<void>;
  onSimulateTelemetry?: (lines: string[]) => void;
  isLightMode?: boolean;
}

export const BluetoothConnectModal: React.FC<BluetoothConnectModalProps> = ({
  isOpen,
  onClose,
  connectionMode,
  portLabel,
  onConnectBluetooth,
  onDisconnect,
  onConnectUSB,
  onSimulateTelemetry,
  isLightMode = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredBluetoothDevice[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);
  const [guideLang, setGuideLang] = useState<'gu' | 'en'>('gu');
  const [showAndroidGuide, setShowAndroidGuide] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setErrorStatus(null);
      setDiscoveredDevices([]);
      setIsScanning(false);
    } else if (Capacitor.isNativePlatform()) {
      // Auto-load paired HC-05 devices immediately on native Android
      handleStartScan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = connectionMode === 'connected_bt';
  const isConnecting = connectionMode === 'connecting' || !!connectingDeviceId;

  const handleStartScan = async () => {
    setErrorStatus(null);
    setIsScanning(true);
    setDiscoveredDevices([]);

    try {
      await hc05Bluetooth.scanForDevices(
        (dev) => {
          setDiscoveredDevices((prev) => {
            if (prev.some((d) => d.id === dev.id)) return prev;
            return [...prev, dev];
          });
        },
        8000
      );
    } catch (err: any) {
      console.warn('Scan exception:', err);
      // Fallback: trigger direct connect request
      try {
        await onConnectBluetooth();
        onClose();
      } catch (connectErr: any) {
        setErrorStatus(connectErr?.message || 'Bluetooth connection was cancelled or unavailable.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = async (deviceId: string) => {
    setErrorStatus(null);
    setConnectingDeviceId(deviceId);
    try {
      await onConnectBluetooth(deviceId);
      onClose();
    } catch (err: any) {
      setErrorStatus(err?.message || 'Failed to connect to selected Bluetooth device.');
    } finally {
      setConnectingDeviceId(null);
    }
  };

  const handleDirectConnect = async () => {
    setErrorStatus(null);
    try {
      await onConnectBluetooth();
      onClose();
    } catch (err: any) {
      setErrorStatus(
        err?.message ||
          'Bluetooth connection request failed. Ensure Bluetooth & Location (GPS) are ON on your Android phone and HC-05 is powered.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in fade-in zoom-in-95 duration-200 ${
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
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500">
              <Bluetooth className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Bluetooth &amp; Hardware Connection</h3>
              <p className="text-xs text-slate-400 font-mono">
                HC-05 (Classic SPP) · HM-10 (BLE) · USB OTG @ 9600 Baud
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Connection Banner */}
          {isConnected ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      BLUETOOTH CONNECTED
                    </div>
                    <div className="text-sm font-semibold">{portLabel || 'HC-05 Serial Module'}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Receiving live Arduino telemetry @ 9600 Baud
                    </div>
                  </div>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-semibold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              {/* Download Firmware Card */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isLightMode
                    ? 'bg-cyan-50/80 border-cyan-200'
                    : 'bg-cyan-950/20 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-cyan-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-300">
                      Installed Arduino Firmware (.ino)
                    </div>
                    <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Download the C++ source code installed in this Arduino
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadArduinoInoFile()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ino</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PRIMARY ANDROID HC-05 ADVISORY BANNER */}
              <div
                className={`rounded-xl border overflow-hidden transition-all ${
                  isLightMode
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="p-3.5 flex items-start justify-between gap-3 border-b border-amber-500/20">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>
                          {guideLang === 'gu'
                            ? '📱 એન્ડ્રોઇડમાં HC-05 કેમ લિસ્ટમાં નથી દેખાતું?'
                            : '📱 Why isn\'t HC-05 showing up in Android?'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 border border-amber-500/40 font-mono">
                          FAQ
                        </span>
                      </div>
                      <p className="text-[11px] opacity-85 mt-0.5">
                        {guideLang === 'gu'
                          ? 'ક્રોમ બ્રાઉઝર અને બ્લૂટૂથ ક્લાસિક (HC-05) વચ્ચેનું તકનીકી કારણ અને ૧૦૦% કામ કરતાં ઉકેલો'
                          : 'Technical reasons why Web Bluetooth cannot discover Bluetooth Classic HC-05 & how to fix it'}
                      </p>
                    </div>
                  </div>

                  {/* Language Toggle */}
                  <div className="flex items-center gap-1 bg-amber-500/20 p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => setGuideLang('gu')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        guideLang === 'gu'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'hover:text-amber-300 opacity-70'
                      }`}
                    >
                      ગુજરાતી
                    </button>
                    <button
                      onClick={() => setGuideLang('en')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                        guideLang === 'en'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'hover:text-amber-300 opacity-70'
                      }`}
                    >
                      ENG
                    </button>
                  </div>
                </div>

                <div className="p-3.5 space-y-2.5 text-xs leading-relaxed">
                  {guideLang === 'gu' ? (
                    <>
                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          મુખ્ય તકનીકી કારણ (Technical Reason):
                        </p>
                        <p className="opacity-90 pl-5">
                          <strong>HC-05</strong> એ <strong>Bluetooth Classic 2.0 (SPP)</strong> મોડ્યુલ છે. ગૂગલ ક્રોમ / બ્રાઉઝર ફક્ત <strong>BLE (Bluetooth Low Energy / Bluetooth 4.0+)</strong> મોડ્યુલ જ સ્કેન કરી શકે છે. આથી ક્રોમના સ્કેનરમાં HC-05 સીધું દેખાતું નથી.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-[11px] pt-1 border-t border-amber-500/20">
                        <p className="font-semibold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          સ્ક્રીન પર "wants to connect to a serial port" અને "No compatible devices found" કેમ આવ્યું?
                        </p>
                        <p className="opacity-90 pl-5 text-[11px] text-rose-300 dark:text-rose-200">
                          આ ડાયલોગ ક્રોમ બ્રાઉઝરનું <strong>ફિઝિકલ વાયર્ડ USB કેબલ</strong> માટેનું છે. જ્યાં સુધી તમે Arduino ને <strong>USB OTG કેબલ</strong> વડે ફોન સાથે નહીં જોડો ત્યાં સુધી એમાં કોઈ ડિવાઈસ નહીં દેખાય. <strong>વાયરલેસ HC-05 બ્લૂટૂથ એ લિસ્ટમાં ક્યારેય નહીં દેખાય</strong> કારણ કે ક્રોમ બ્રાઉઝર વાયરલેસ બ્લૂટૂથને USB Serial પોર્ટ તરીકે માન્ય રાખતું નથી.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-[11px] pt-1 border-t border-amber-500/20">
                        <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          આ સમસ્યાના ૩ ૧૦૦% સાચા ઉકેલો (3 Working Solutions):
                        </p>
                        <ol className="list-decimal list-inside space-y-1.5 opacity-95 pl-1 font-sans">
                          <li>
                            <strong>ઉકેલ ૧ (વાયરલેસ HC-05 માટે સૌથી બેસ્ટ): Native Android APK ઇન્સ્ટોલ કરો</strong> &mdash; 
                            તમારા GitHub Releases પરથી બનાવેલી APK ફોનમાં ઇન્સ્ટોલ કરો. એ APK માં <strong>સ્પેશિયલ નેટિવ Java બ્લૂટૂથ ડ્રાઇવર</strong> સામેલ છે જે HC-05 (PIN 1234) સાથે સીધું વાયરલેસ કનેક્ટ થઈ જશે!
                          </li>
                          <li>
                            <strong>ઉકેલ ૨ (બ્રાઉઝરમાં ચલાવવા માટે): USB OTG કેબલ જોડો</strong> &mdash; 
                            આર્ડ્યુનોને વાદળી USB કેબલ અને ₹૨૦ ના OTG એડેપ્ટર વડે સીધું તમારા મોબાઇલમાં જોડો અને પછી જ "Connect via USB Cable" બટન દબાવો. ક્રોમમાં ૧૦૦% ડેટા તરત ચાલુ થઈ જશે!
                          </li>
                          <li>
                            <strong>ઉકેલ ૩ (બ્રાઉઝરમાં વાયરલેસ માટે): HM-10 / AT-09 BLE મોડ્યુલ વાપરો</strong> &mdash; 
                            HC-05 ની જગ્યાએ HM-10 BLE મોડ્યુલ લગાવો (તે જ 4 વાયર VCC, GND, TX, RX). ક્રોમના બ્લૂટૂથમાં તે તરત જ દેખાશે.
                          </li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          Root Cause (Why it doesn't show):
                        </p>
                        <p className="opacity-90 pl-5">
                          <strong>HC-05</strong> uses <strong>Bluetooth Classic 2.0 (SPP profile)</strong>. Standard web browsers (Chrome/Brave) strictly scan only <strong>BLE (Bluetooth Low Energy 4.0+)</strong> peripherals due to W3C security standards.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-[11px] pt-1 border-t border-amber-500/20">
                        <p className="font-semibold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          Why does Chrome show "wants to connect to a serial port" &amp; "No compatible devices found"?
                        </p>
                        <p className="opacity-90 pl-5 text-[11px] text-rose-300 dark:text-rose-200">
                          That dialog is Chrome's <strong>physical wired USB cable</strong> picker. Unless your Arduino is physically plugged into your phone with a <strong>USB OTG cable</strong>, no devices will appear. <strong>Wireless Bluetooth (HC-05) will NEVER appear in the serial port popup</strong> because Google Chrome does not bridge Bluetooth RFCOMM to Web Serial on Android.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-[11px] pt-1 border-t border-amber-500/20">
                        <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          3 Guaranteed Working Solutions:
                        </p>
                        <ol className="list-decimal list-inside space-y-1.5 opacity-95 pl-1 font-sans">
                          <li>
                            <strong>Solution 1 (Best for Wireless HC-05): Install the Native Android APK</strong> &mdash; 
                            Install the Android APK built by your GitHub Actions workflow. The APK includes a <strong>custom native Java Bluetooth RFCOMM driver</strong> that discovers and pairs with HC-05 (PIN 1234) directly!
                          </li>
                          <li>
                            <strong>Solution 2 (For Web Browser): Connect via USB OTG Cable</strong> &mdash; 
                            Plug your Arduino Uno into your phone using a USB cable and a cheap USB OTG adapter. Once plugged in, the serial port dialog will detect Arduino immediately!
                          </li>
                          <li>
                            <strong>Solution 3 (For Wireless in Web Browser): Use HM-10 / AT-09 BLE Module</strong> &mdash; 
                            Replace the HC-05 with an HM-10 BLE module (uses same 4 pins VCC, GND, TX, RX). It appears right away in Chrome's Web Bluetooth scanner.
                          </li>
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scan & Connect Primary Actions */}
              <div
                className={`p-4 rounded-xl border text-center space-y-3.5 ${
                  isLightMode
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-blue-950/20 border-blue-500/30'
                }`}
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                      <Bluetooth className={`w-7 h-7 ${isScanning ? 'animate-bounce' : ''}`} />
                    </div>
                    {isScanning && (
                      <span className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Connect to Arduino Wireless Module</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Ensure HC-05 / HM-10 is powered and blinking. On Android, make sure{' '}
                    <strong className="text-amber-400">Location (GPS)</strong> is turned ON.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  {/* Bluetooth Connect */}
                  <button
                    onClick={handleDirectConnect}
                    disabled={isConnecting}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pairing...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-4 h-4" />
                        <span>Select &amp; Connect Bluetooth</span>
                      </>
                    )}
                  </button>

                  {/* USB OTG Direct Alternative (Wired USB Cable Only) */}
                  <button
                    onClick={() => {
                      onClose();
                      onConnectUSB();
                    }}
                    title="Requires Arduino connected via physical USB OTG cable adapter"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Usb className="w-4 h-4" />
                    <span>Connect USB Cable (OTG Adapter)</span>
                  </button>

                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl border font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isLightMode
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Scan Devices'}</span>
                  </button>
                </div>
              </div>

              {/* Discovered Device List */}
              {discoveredDevices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                    Nearby Devices Found:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {discoveredDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isLightMode
                            ? 'bg-slate-50 border-slate-200 hover:border-blue-400'
                            : 'bg-slate-800/60 border-slate-700 hover:border-blue-500/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold">{dev.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                              {dev.id}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeviceSelect(dev.id)}
                          disabled={connectingDeviceId === dev.id}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          {connectingDeviceId === dev.id ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Status Display */}
              {errorStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    isLightMode
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-bold">Notice: </span>
                    <span>{errorStatus}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Android HC-05 Hardware & LED Checklist */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
            }`}
          >
            <div
              className={`font-semibold flex items-center justify-between font-mono ${
                isLightMode ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>
                  {guideLang === 'gu'
                    ? 'HC-05 મોડ્યુલ LED લાઈટ ચેકલિસ્ટ'
                    : 'HC-05 Module LED Status Checklist'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">9600 Baud</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div
                className={`p-2 rounded-lg border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-700/70'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    {guideLang === 'gu' ? 'ઝડપી ઝબૂકવું (Fast Blink)' : 'Fast Blinking (2x/sec)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {guideLang === 'gu'
                    ? 'મોડ્યુલ ચાલુ છે અને પેરિંગ માટે તૈયાર છે. ફોન સેટિંગ્સમાં PIN 1234 નાખો.'
                    : 'Ready for pairing. Open Phone Settings > Bluetooth > Pair PIN 1234.'}
                </p>
              </div>

              <div
                className={`p-2 rounded-lg border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-700/70'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>
                    {guideLang === 'gu' ? 'ધીમું ઝબૂકવું (Slow Blink)' : 'Slow Blink (1x/2sec)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {guideLang === 'gu'
                    ? 'AT કમાન્ડ મોડમાં છે! EN/KEY પિન છોડાવો અને ફરીથી પાવર આપો.'
                    : 'In AT command mode! Disconnect KEY/EN pin and power cycle.'}
                </p>
              </div>

              <div
                className={`p-2 rounded-lg border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-700/70'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>
                    {guideLang === 'gu' ? 'બે વાર ઝબૂકવું (Double Blink)' : 'Double Blink (2 sec)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {guideLang === 'gu'
                    ? 'સફળતાપૂર્વક કનેક્ટ થઈ ગયું છે અને ડેટા ટ્રાન્સફર શરૂ છે.'
                    : 'Successfully paired and communicating.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Arduino UNO Wiring Guide */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
            }`}
          >
            <div
              className={`font-semibold flex items-center justify-between font-mono ${
                isLightMode ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>HC-05 Arduino UNO Wiring (SoftwareSerial @ 9600 Baud)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">Classic SPP</span>
            </div>
            <ul
              className={`space-y-1 list-disc list-inside text-[11px] leading-relaxed ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <li>
                <strong>VCC:</strong> Arduino 5V &middot; <strong>GND:</strong> Arduino GND
              </li>
              <li>
                <strong>HC-05 TXD:</strong> Connect to Arduino <strong>D2</strong> (SoftwareSerial RX)
              </li>
              <li>
                <strong>Arduino D3:</strong> Connect to <strong>2.2kΩ resistor</strong> &rarr; HC-05 RXD
              </li>
              <li>
                <strong>HC-05 RXD junction:</strong> Connect to <strong>3.3kΩ resistor</strong> &rarr; GND (3.3V logic level)
              </li>
              <li>
                <strong>EN/KEY pin:</strong> Leave <strong>NOT connected</strong>
              </li>
              <li>
                <strong>Baud Rate:</strong> 9600 baud &middot; <strong>Pairing PIN:</strong> 1234 or 0000
              </li>
            </ul>
          </div>

          {/* Test Packet Simulator Buttons */}
          {onSimulateTelemetry && (
            <div
              className={`p-3 rounded-xl border space-y-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-400">
                  {guideLang === 'gu'
                    ? 'લાઈવ ટેલિમેટ્રી સિમ્યુલેટર (હાર્ડવેર વગર ટેસ્ટ કરો):'
                    : 'Live Hardware Telemetry Simulator:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                <button
                  onClick={() => {
                    onSimulateTelemetry([
                      'S1:OCCUPIED',
                      'S2:EMPTY',
                      'S3:OCCUPIED',
                      'TOTAL:2',
                      'GATE:OPEN',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  2 Occupied (S1 &amp; S3)
                </button>
                <button
                  onClick={() => {
                    onSimulateTelemetry([
                      'S1:1',
                      'S2:1',
                      'S3:1',
                      'TOTAL:3',
                      'GATE:CLOSED',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Lot Full (S1, S2, S3 &rarr; Gate Closed)
                </button>
                <button
                  onClick={() => {
                    onSimulateTelemetry([
                      'S1:EMPTY',
                      'S2:EMPTY',
                      'S3:OCCUPIED',
                      'TOTAL:1',
                      'GATE:OPEN',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Vehicle Exited (Auto-Bill Cut)
                </button>
              </div>
            </div>
          )}

          {/* Bottom Alternatives */}
          <div
            className={`pt-2 border-t flex items-center justify-between gap-2 ${
              isLightMode ? 'border-slate-200' : 'border-slate-700/60'
            }`}
          >
            <button
              onClick={() => {
                onClose();
                onConnectUSB();
              }}
              className={`text-xs font-mono hover:underline flex items-center gap-1.5 cursor-pointer font-bold ${
                isLightMode ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            >
              <Usb className="w-3.5 h-3.5" />
              <span>Connect via USB Cable (OTG on Android)</span>
            </button>

            <span className="text-[10px] text-slate-500 font-mono">
              શ્રી સરકારી માધ્યમિક શાળા લાખાપર
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
