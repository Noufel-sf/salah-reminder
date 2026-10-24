import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, X, Plus } from 'lucide-react';
import { AppSettings, PrayerItem } from '../types/prayer';
import { calculatePrayerTimes, DEFAULT_SETTINGS } from '../utils/prayerTimes';
import { audioService } from '../utils/audio';
import { incrementDhikr } from '../utils/worshipStats';

const STORAGE_KEY = 'noor_prayer_settings';

interface MiniWidgetViewProps {
  isStandalone?: boolean;
  settings?: AppSettings;
  onClose?: () => void;
  onOpenMain?: () => void;
}

export const MiniWidgetView: React.FC<MiniWidgetViewProps> = ({
  isStandalone = false,
  settings: propSettings,
  onClose,
  onOpenMain
}) => {
  const [internalSettings, setInternalSettings] = useState<AppSettings>(() => {
    if (propSettings) return propSettings;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const effectiveSettings = propSettings || internalSettings;

  useEffect(() => {
    if (isStandalone) {
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      document.body.style.overflow = 'hidden';
    }
  }, [isStandalone]);

  useEffect(() => {
    if (propSettings) {
      setInternalSettings(propSettings);
    }
  }, [propSettings]);

  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setInternalSettings(e.detail);
      }
    };
    window.addEventListener('prayer-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('prayer-settings-updated', handleSettingsUpdate);
  }, []);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [showTasbihPulse, setShowTasbihPulse] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerData = useMemo(() => {
    return calculatePrayerTimes(effectiveSettings, currentTime);
  }, [effectiveSettings, currentTime]);

  const nextPrayer: PrayerItem | null = prayerData.nextPrayer;

  // Calculate remaining time
  const remaining = useMemo(() => {
    if (!nextPrayer) return { text: '--:--', isImminent: false };
    const now = currentTime.getTime();
    const target = new Date(nextPrayer.time).getTime();
    const diff = Math.max(0, target - now);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const text =
      hours > 0
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return {
      text,
      isImminent: diff < 15 * 60 * 1000 // less than 15 mins
    };
  }, [nextPrayer, currentTime]);

  const handleQuickTasbih = () => {
    const res = incrementDhikr('tasbih', 1);
    setTasbihCount(res.tasbih);
    audioService.playBeep(0.12);
    setShowTasbihPulse(true);
    setTimeout(() => setShowTasbihPulse(false), 800);
  };

  // Hotkey Space inside widget for instant Tasbih
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleQuickTasbih();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleOpenMain = () => {
    if (onOpenMain) {
      onOpenMain();
    }
    if (window.electronAPI?.openMain) {
      window.electronAPI.openMain();
    }
  };

  const handleCloseWidget = () => {
    if (onClose) {
      onClose();
    }
    if (isStandalone && window.electronAPI?.closeWidget) {
      window.electronAPI.closeWidget();
    }
  };

  return (
    <div
      className={
        isStandalone
          ? 'w-screen h-screen flex items-center justify-center p-1 select-none font-readex bg-transparent overflow-hidden'
          : 'w-full h-full select-none font-readex overflow-hidden'
      }
      style={isStandalone ? ({ WebkitAppRegion: 'drag' } as any) : undefined}
    >
      <div className="w-full h-full bg-[#0b1f16]/95 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-md px-3.5 py-2 flex items-center justify-between text-white relative rounded-none">
        {/* Decorative corner indicator */}
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />

        {/* Right Info Section (Prayer info & Countdown in RTL) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-none ${remaining.isImminent ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-xs font-bold text-emerald-200 truncate">
                {nextPrayer ? (nextPrayer.arabicName || nextPrayer.name) : 'الصلاة'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({nextPrayer ? nextPrayer.timeString : '--:--'})
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-mono text-xl font-extrabold tracking-wider ${remaining.isImminent ? 'text-amber-300' : 'text-emerald-100'}`}>
                {remaining.text}
              </span>
              <span className="text-[10px] text-slate-400 font-readex">متبقي</span>
            </div>
          </div>
        </div>

        {/* Left Action Buttons (no-drag) */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          {/* Quick Tasbih Button */}
          <button
            type="button"
            onClick={handleQuickTasbih}
            className={`px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-400/30 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
              showTasbihPulse ? 'scale-110 bg-emerald-600' : ''
            }`}
            title="تسبيح سريع (مفتاح المسافة)"
          >
            <Plus size={11} />
            <span>تسبيح</span>
            {tasbihCount > 0 && (
              <span className="font-mono text-[10px] text-emerald-300">({tasbihCount})</span>
            )}
          </button>

          {/* Open Main Window */}
          <button
            type="button"
            onClick={handleOpenMain}
            className="p-1.5 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/60 cursor-pointer transition-colors"
            title="فتح نافذة التطبيق الرئيسية"
          >
            <Maximize2 size={13} />
          </button>

          {/* Close Widget */}
          <button
            type="button"
            onClick={handleCloseWidget}
            className="p-1.5 bg-slate-800/70 hover:bg-rose-900/80 text-slate-400 hover:text-white border border-slate-600/60 cursor-pointer transition-colors"
            title="إخفاء الودجت العائم"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
