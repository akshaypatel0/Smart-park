import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Globe,
  Radio,
  ExternalLink,
  Printer,
  Smartphone,
  Server,
  Sparkles,
  Wifi,
  Info,
} from 'lucide-react';
import QRCode from 'qrcode';
import { cloudSync } from '../services/cloudSyncService';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
  totalOccupied: number;
  totalSlots: number;
  isHardwareConnected: boolean;
  connectionMode: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
  totalOccupied,
  totalSlots,
  isHardwareConnected,
  connectionMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedGH, setCopiedGH] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(cloudSync.getBroadcasting());
  const [publicUrl, setPublicUrl] = useState('');
  const [githubPagesBase, setGithubPagesBase] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartparking_gh_pages_url') || 'https://akshaypatel0.github.io/Smart-park/';
    }
    return 'https://akshaypatel0.github.io/Smart-park/';
  });
  const [selectedLinkType, setSelectedLinkType] = useState<'current' | 'github'>('current');
  const [packetsSent, setPacketsSent] = useState(cloudSync.getPacketsSent());
  const [systemId, setSystemId] = useState(cloudSync.getSystemId());

  // Determine active link based on toggle
  const effectiveLiveUrl = React.useMemo(() => {
    const sysParam = systemId ? `&sys=${encodeURIComponent(systemId)}` : '';
    if (selectedLinkType === 'github') {
      const base = githubPagesBase.trim().replace(/\/+$/, '');
      if (!base) return publicUrl;
      const separator = base.includes('?') ? '&' : '?';
      return `${base}/${separator}view=live${sysParam}`;
    }
    return publicUrl;
  }, [selectedLinkType, githubPagesBase, publicUrl, systemId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Build clean current public link with view=live parameter
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'live');
      if (systemId) {
        url.searchParams.set('sys', systemId);
      }
      url.searchParams.delete('action');
      setPublicUrl(url.toString());
    }
  }, [isOpen, systemId]);

  // Update QR code whenever effective URL changes
  useEffect(() => {
    if (!effectiveLiveUrl) return;

    QRCode.toDataURL(effectiveLiveUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0a0f1d',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });
  }, [effectiveLiveUrl, isOpen]);

  // Track real-time broadcast packets
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPacketsSent(cloudSync.getPacketsSent());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (effectiveLiveUrl) {
      navigator.clipboard.writeText(effectiveLiveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleBroadcast = () => {
    const next = !isBroadcasting;
    setIsBroadcasting(next);
    cloudSync.setBroadcasting(next);
  };

  const handleSaveGithubPages = (val: string) => {
    setGithubPagesBase(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartparking_gh_pages_url', val);
    }
  };

  const freeSlots = Math.max(0, totalSlots - totalOccupied);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
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
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <QrCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Public Live Link &amp; QR Code</h3>
              <p className="text-xs text-slate-400 font-mono">
                કોઈપણ વ્યક્તિ GitHub Pages પરથી લાઈવ ૩ સ્લોટ જોઈ શકશે
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Cloud Gateway Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isBroadcasting
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio
                className={`w-4 h-4 shrink-0 ${isBroadcasting ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`}
              />
              <div>
                <span className="font-bold flex items-center gap-1.5">
                  <span>{isBroadcasting ? 'Firebase Gateway સિન્ક ચાલુ છે' : 'ક્લાઉડ સિન્ક બંધ છે'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {packetsSent} packets sent
                  </span>
                </span>
                <p className="text-[11px] opacity-80">
                  {isHardwareConnected
                    ? 'તમારો ફોન (Gateway APK) આર્ડ્યુનો ડેટા Firebase સર્વર પર મોકલી રહ્યો છે'
                    : 'Gateway ફોન બ્લૂટૂથ કનેક્ટ થશે એટલે ડેટા ઓટોમેટિક Firebase પર લાઈવ થશે'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleBroadcast}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                isBroadcasting
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isBroadcasting ? 'Active' : 'Turn On'}
            </button>
          </div>

          {/* Architecture Visualizer Card */}
          <div
            className={`p-3 rounded-xl border ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>લાઈવ લિંક આર્કિટેક્ચર (Hydrosense મોડેલ):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span className="font-bold block">1. Gateway Phone</span>
                <span className="opacity-75 text-[9px]">Bluetooth HC-05</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <Server className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <span className="font-bold block">2. Firebase Cloud</span>
                <span className="opacity-75 text-[9px]">Internet / Firestore</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Globe className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span className="font-bold block">3. GitHub Pages</span>
                <span className="opacity-75 text-[9px]">Live 3-Slot View</span>
              </div>
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center space-y-3 ${
              isLightMode
                ? 'bg-slate-50 border-slate-200 shadow-inner'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            {/* Real QR Code Display */}
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Public Live Parking QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 animate-spin" />
                </div>
              )}
            </div>

            {/* Live Status Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {freeSlots > 0
                    ? `🟢 ${freeSlots} સ્લોટ ખાલી (Available)`
                    : '🔴 પાર્કિંગ ફૂલ (All Full)'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                🔒 100% Read-Only
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm">
              આ QR કોડ સ્કેન કરવાથી પબ્લિક લાઈવ સ્ક્રીન ખૂલશે — જેમાં ૧, ૨ અને ૩ નંબરના કયા સ્લોટ ખાલી છે તે રીઅલ-ટાઇમ દેખાશે.
            </p>
          </div>

          {/* Target URL Selector (Current App URL vs GitHub Pages URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>લાઈવ લિંક સોર્સ પસંદ કરો:</span>
              </span>
              <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedLinkType('current')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedLinkType === 'current'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Current App
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLinkType('github')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedLinkType === 'github'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GitHub Pages
                </button>
              </div>
            </div>

            {selectedLinkType === 'github' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">
                  GitHub Pages URL (તમારા GitHub Pages રિપોઝિટરીની લિંક):
                </label>
                <input
                  type="text"
                  value={githubPagesBase}
                  onChange={(e) => handleSaveGithubPages(e.target.value)}
                  placeholder="https://yourusername.github.io/smart-parking/"
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-hidden ${
                    isLightMode
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                />
              </div>
            )}

            {/* Generated Live URL Display & Copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={effectiveLiveUrl}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-hidden select-all ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/20"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => window.open(effectiveLiveUrl, '_blank')}
              className={`flex-1 py-2.5 px-3 rounded-xl border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Open Live View</span>
            </button>
            <button
              onClick={handlePrint}
              className={`flex-1 py-2.5 px-3 rounded-xl border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Print Poster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
