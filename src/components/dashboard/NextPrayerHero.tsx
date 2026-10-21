import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import { PrayerItem } from '../../types/prayer';

interface NextPrayerHeroProps {
  nextPrayer: PrayerItem | null;
  currentPrayer: PrayerItem | null;
}

export const NextPrayerHero: React.FC<NextPrayerHeroProps> = ({
  nextPrayer,
  currentPrayer
}) => {
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    progress: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMinutes: 0,
    progress: 0
  });

  useEffect(() => {
    if (!nextPrayer) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(nextPrayer.time).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const totalMinutes = Math.floor(diff / (1000 * 60));

      const prevTime = currentPrayer ? new Date(currentPrayer.time).getTime() : target - 3.5 * 3600 * 1000;
      const totalSpan = Math.max(1000, target - prevTime);
      const elapsed = Math.max(0, now - prevTime);
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setCountdown({
        hours,
        minutes,
        seconds,
        totalMinutes,
        progress: progressPercent
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, currentPrayer]);

  if (!nextPrayer) return null;

  // Format natural language relative time (e.g. "Begins in 56 minutes" or "Begins in 1 hour 12 minutes")
  const getRelativeText = () => {
    if (countdown.hours === 0 && countdown.minutes === 0) {
      return `Begins in ${countdown.seconds} seconds`;
    }
    if (countdown.hours === 0) {
      return `Begins in ${countdown.minutes} minute${countdown.minutes === 1 ? '' : 's'}`;
    }
    return `Begins in ${countdown.hours} hour${countdown.hours === 1 ? '' : 's'} ${countdown.minutes} min`;
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="hero-card p-6 md:p-7 relative select-none">
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15">
              Next Prayer
            </span>
            {nextPrayer.notificationEnabled && (
              <span className="flex items-center gap-1 text-[11px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                <Bell size={11} strokeWidth={2.2} />
                <span>Alert On</span>
              </span>
            )}
          </div>

          {/* Clean live countdown pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/10 font-mono text-xs font-semibold text-white/95">
            <span className="w-1.5 h-1.5 rounded-full bg-[#44B892] animate-pulse" />
            <span>{padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}</span>
          </div>
        </div>

        {/* Center: Prayer Name, Arabic & Scheduled Time */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 my-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {nextPrayer.name}
            </h3>
            <span className="text-white/40 text-xl font-light">|</span>
            <span className="arabic-text text-2xl md:text-3xl font-bold text-white/90">
              {nextPrayer.arabicName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold font-mono tracking-tight text-white/95">
            <Clock size={20} strokeWidth={2} className="text-[#44B892]" />
            <span>{nextPrayer.timeString}</span>
          </div>
        </div>

        {/* Natural Language Countdown & Progress Indicator */}
        <div className="mt-5 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/80 mb-2">
            <span className="font-medium">{getRelativeText()}</span>
            <span className="text-[11px] text-white/60 font-mono">
              {Math.round(countdown.progress)}% elapsed
            </span>
          </div>

          {/* Refined restrained progress bar */}
          <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#44B892] to-[#80E5BE] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${countdown.progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(countdown.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
