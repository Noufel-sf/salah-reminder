import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Calendar, Sparkles } from 'lucide-react';
import { getHijriDate } from '../utils/prayerTimes';

interface DesktopTopBarProps {
  title?: string;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({ title }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hijri = getHijriDate(currentTime);
  const gregorianStr = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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
    <div className="titlebar-drag bg-white border-b border-[#e4eee6] px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Greeting & Current View Title */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#114232]">
              {title || 'Assalamu Alaikum'}
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2d6a4f] bg-[#eaf4ee] px-2.5 py-0.5 rounded-full border border-[#d8e6dc]">
              <Sparkles size={11} className="text-[#52b788]" />
              Blessed Day
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#74897f]">
            <Calendar size={12} className="text-[#52b788]" />
            <span>{gregorianStr}</span>
            <span>•</span>
            <span className="font-semibold text-[#2d6a4f]">{hijri.formatted}</span>
            <span className="arabic-calligraphy text-xs text-[#40916c] font-bold">({hijri.arabic})</span>
          </div>
        </div>
      </div>

      {/* Right: Window Controls */}
      <div className="titlebar-no-drag flex items-center gap-1.5">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2] transition-colors"
          title="Minimize"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2] transition-colors"
          title={isMaximized ? 'Restore Window' : 'Maximize Window'}
        >
          {isMaximized ? <Copy size={13} /> : <Square size={13} />}
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#74897f] hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Close to Tray"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
