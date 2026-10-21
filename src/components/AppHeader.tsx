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
    <header 
      className="titlebar-drag border-b px-8 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 select-none transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Left: Page Title & Subtitle with responsive hierarchy */}
      <div className="min-w-0">
        <h2 
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p 
            className="text-xs font-normal"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subtitle}
          </p>
          <span 
            className="hidden sm:inline text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            •
          </span>
          <button
            onClick={onOpenLocationSettings}
            className="titlebar-no-drag inline-flex items-center gap-1 text-xs font-medium cursor-pointer hover:underline transition-colors"
            style={{ color: 'var(--color-primary)' }}
            title="Change City"
          >
            <MapPin size={11} strokeWidth={2.2} />
            <span>{cityName}, {countryName}</span>
          </button>
        </div>
      </div>

      {/* Right: Date Badge, Notification & Desktop Window Controls */}
      <div className="titlebar-no-drag flex items-center gap-3 ml-auto">
        {/* Compact Gregorian + Hijri Date badge */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-2xs"
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
        >
          <Calendar size={13} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
          <span className="font-medium">{gregorianStr}</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{hijri.formatted}</span>
        </div>

        {/* Window controls */}
        <div 
          className="flex items-center gap-1 pl-2 border-l"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Minimize window"
            aria-label="Minimize window"
          >
            <Minus size={14} strokeWidth={2} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            title={isMaximized ? 'Restore window' : 'Maximize window'}
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          >
            {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
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
