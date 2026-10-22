import React from 'react';
import { 
  Minus, 
  X, 
  Settings as SettingsIcon, 
  Compass, 
  MapPin, 
  Volume2, 
  VolumeX,
  Moon
} from 'lucide-react';
import { AppSettings } from '../types/prayer';
import { getHijriDate } from '../utils/prayerTimes';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenQibla: () => void;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenQibla,
  onToggleMute
}) => {
  const isMuted = settings.soundOption === 'silent';
  const today = new Date();
  const hijri = getHijriDate(today);

  const formattedGregorian = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b13]/85 backdrop-blur-md border-b border-white/[0.06] select-none">
      {/* Frameless Drag Bar & Window Controls */}
      <div className="titlebar-drag flex items-center justify-between px-3.5 py-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Moon size={11} className="fill-emerald-400/20" />
          </div>
          <span className="font-semibold text-slate-200 tracking-wide">Noor</span>
          <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Salah
          </span>
        </div>

        {/* Window controls */}
        <div 
          className="titlebar-no-drag flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleMinimize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
            title="Close to Tray"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Main Top Bar Info */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Date & Location */}
        <div>
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group cursor-pointer"
          >
            <MapPin size={12} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{settings.city}, {settings.country}</span>
          </button>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
            <span>{formattedGregorian}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">{hijri.formatted}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-emerald-400'
            }`}
            title={isMuted ? 'Unmute Prayer Alerts' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={onOpenQibla}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-emerald-400 transition-all"
            title="Qibla Direction"
          >
            <Compass size={15} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-emerald-400 transition-all"
            title="Settings & Calculation Methods"
          >
            <SettingsIcon size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
