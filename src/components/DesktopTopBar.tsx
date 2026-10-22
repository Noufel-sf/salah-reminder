import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Calendar, Bell } from 'lucide-react';
import { getHijriDate } from '../utils/prayerTimes';

interface DesktopTopBarProps {
  title: string;
  subtitle: string;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({ title, subtitle }) => {
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
    <div className="titlebar-drag bg-white border-b border-[#e5ede7] px-8 py-3.5 flex items-center justify-between shrink-0 select-none">
      {/* Left: View Title & Subtitle matching Ramadhan Pro */}
      <div className="leading-tight">
        <h2 className="text-lg font-bold text-[#123d2e] tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-[#71887e] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right: Date Badge, Notification & Window Controls */}
      <div className="titlebar-no-drag flex items-center gap-3">
        {/* Date pill */}
        <div className="flex items-center gap-2 bg-[#f4f7f5] border border-[#e5ede7] px-3.5 py-1.5 rounded-xl text-xs text-[#3c5248]">
          <Calendar size={13} className="text-[#24634c]" />
          <span className="font-medium">{gregorianStr}</span>
          <span className="text-[#98aba2]">•</span>
          <span className="font-semibold text-[#123d2e]">{hijri.formatted}</span>
        </div>

        {/* Bell icon button */}
        <div className="w-8 h-8 rounded-xl border border-[#e5ede7] bg-white flex items-center justify-center text-[#556e62]">
          <Bell size={14} />
        </div>

        {/* Window controls */}
        <div 
          className="titlebar-no-drag flex items-center gap-1 pl-2 border-l border-[#e5ede7]"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleMinimize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-lg flex items-center justify-center text-[#71887e] hover:text-[#123d2e] hover:bg-[#f1f6f2] transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={handleMaximize}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-lg flex items-center justify-center text-[#71887e] hover:text-[#123d2e] hover:bg-[#f1f6f2] transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Window' : 'Maximize Window'}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="titlebar-no-drag w-7 h-7 rounded-lg flex items-center justify-center text-[#71887e] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Close to Tray"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
