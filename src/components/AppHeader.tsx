import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Calendar, MapPin, AppWindow } from 'lucide-react';
import { getHijriDate, getGregorianDateArabic } from '../utils/prayerTimes';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  cityName: string;
  countryName: string;
  onOpenLocationSettings: () => void;
  onToggleWidget?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  cityName,
  countryName,
  onOpenLocationSettings,
  onToggleWidget
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [browserNotice, setBrowserNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleFullscreenChange = () => {
      setIsMaximized(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const showNotice = (msg: string) => {
    setBrowserNotice(msg);
    setTimeout(() => setBrowserNotice(null), 3000);
  };

  const hijri = getHijriDate(currentTime);
  const gregorianStr = getGregorianDateArabic(currentTime);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-minimize');
    } else {
      showNotice('خاصية التصغير لشريط المهام تعمل في تطبيق سطح المكتب المستقل (Windows App)');
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
      setIsMaximized((prev) => !prev);
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-maximize');
      setIsMaximized((prev) => !prev);
    } else {
      // Browser preview mode: Toggle Fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
        setIsMaximized(true);
      } else {
        document.exitFullscreen?.().catch(() => {});
        setIsMaximized(false);
      }
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.send('window-close');
    } else {
      showNotice('إغلاق التطبيق إلى صينية النظام (System Tray) يعمل في تطبيق سطح المكتب المستقل');
    }
  };

  return (
    <header className="titlebar-drag h-16 px-8 bg-white dark:bg-[#0c1611] border-b border-slate-200/90 dark:border-[#1a2c25] flex items-center justify-between shrink-0 select-none">
      {/* Right in RTL: View Title & Subtitle */}
      <div className="leading-tight text-right">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-readex">
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{subtitle}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <button
            onClick={onOpenLocationSettings}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-slate-200 dark:border-[#233b31] bg-slate-50/80 dark:bg-[#12201b] text-xs text-slate-700 dark:text-slate-300">
          <Calendar size={13} strokeWidth={2} className="text-emerald-700 dark:text-emerald-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{gregorianStr}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="font-bold text-emerald-900 dark:text-emerald-300 font-amiri text-sm">{hijri.arabic}</span>
        </div>

        {/* Mini Widget button */}
        {onToggleWidget && (
          <button
            type="button"
            onClick={onToggleWidget}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-emerald-300/80 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition-colors cursor-pointer"
            title="تشغيل الودجت المصغر العائم لسطح المكتب (Always-on-top)"
          >
            <AppWindow size={13} strokeWidth={2} className="text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">الودجت العائم</span>
          </button>
        )}

        {/* Window controls */}
        <div 
          className="titlebar-no-drag flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-[#233b31]"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleMinimize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1b2f27] transition-colors cursor-pointer"
            title="تصغير النافذة"
            aria-label="تصغير النافذة"
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1b2f27] transition-colors cursor-pointer"
            title={isMaximized ? 'استعادة الحجم' : 'تكبير النافذة'}
            aria-label={isMaximized ? 'استعادة الحجم' : 'تكبير النافذة'}
          >
            {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-none flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="إغلاق إلى شريط المهام"
            aria-label="إغلاق إلى شريط المهام"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Floating notice for browser preview */}
      {browserNotice && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 border border-emerald-500/50 shadow-xl flex items-center gap-2 font-readex animate-fade-in">
          <span className="w-2 h-2 bg-emerald-400 rounded-none animate-ping" />
          <span>{browserNotice}</span>
        </div>
      )}
    </header>
  );
};
