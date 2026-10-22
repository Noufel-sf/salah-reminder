import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Calendar, MapPin } from 'lucide-react';
import { getHijriDate, getGregorianDateArabic } from '../utils/prayerTimes';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  cityName: string;
  countryName: string;
  onOpenLocationSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  cityName,
  countryName,
  onOpenLocationSettings
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijri = getHijriDate(currentTime);
  const gregorianStr = getGregorianDateArabic(currentTime);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-minimize');
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
      setIsMaximized((prev) => !prev);
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-maximize');
      setIsMaximized((prev) => !prev);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-close');
    }
  };

  return (
    <header className="titlebar-drag h-16 px-8 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 select-none">
      {/* Right in RTL: View Title & Subtitle */}
      <div className="leading-tight text-right">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-readex">
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span>{subtitle}</span>
          <span>•</span>
          <button
            onClick={onOpenLocationSettings}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline cursor-pointer"
            title="تغيير المدينة والإحداثيات"
          >
            <MapPin size={11} strokeWidth={2.2} />
            <span>{cityName}، {countryName}</span>
          </button>
        </div>
      </div>

      {/* Left in RTL: Date Badge & Window Controls */}
      <div 
        className="titlebar-no-drag flex items-center gap-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Date pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-slate-200 bg-slate-50/80 text-xs text-slate-700">
          <Calendar size={13} strokeWidth={2} className="text-emerald-700" />
          <span className="font-medium text-slate-700">{gregorianStr}</span>
          <span className="text-slate-300">|</span>
          <span className="font-bold text-emerald-900 font-amiri text-sm">{hijri.arabic}</span>
        </div>

        {/* Window controls */}
        <div 
          className="titlebar-no-drag flex items-center gap-1 pr-2 border-r border-slate-200"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleMinimize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="تصغير النافذة"
            aria-label="تصغير النافذة"
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isMaximized ? 'استعادة الحجم' : 'تكبير النافذة'}
            aria-label={isMaximized ? 'استعادة الحجم' : 'تكبير النافذة'}
          >
            {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="إغلاق إلى شريط المهام"
            aria-label="إغلاق إلى شريط المهام"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};
