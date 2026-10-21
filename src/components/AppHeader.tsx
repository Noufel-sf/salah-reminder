import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Calendar, MapPin } from 'lucide-react';
import { getHijriDate } from '../utils/prayerTimes';

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
  const gregorianStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <header className="titlebar-drag h-16 px-8 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 select-none">
      {/* Left: View Title & Subtitle */}
      <div className="leading-tight">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span>{subtitle}</span>
          <span>•</span>
          <button
            onClick={onOpenLocationSettings}
            className="titlebar-no-drag inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline cursor-pointer"
            title="Change City & Coordinates"
          >
            <MapPin size={11} strokeWidth={2.2} />
            <span>{cityName}, {countryName}</span>
          </button>
        </div>
      </div>

      {/* Right: Date Badge & Window Controls */}
      <div className="titlebar-no-drag flex items-center gap-3">
        {/* Date pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-700">
          <Calendar size={13} strokeWidth={2} className="text-emerald-700" />
          <span className="font-medium">{gregorianStr}</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-emerald-900">{hijri.formatted}</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Minimize"
            aria-label="Minimize window"
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          >
            {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Close to tray"
            aria-label="Close to tray"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};
