import React, { useEffect, useState } from 'react';
import { Clock, Bell, Sparkles } from 'lucide-react';
import { PrayerItem } from '../types/prayer';

interface NextPrayerCardProps {
  nextPrayer: PrayerItem | null;
  currentPrayer: PrayerItem | null;
}

export const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
  nextPrayer,
  currentPrayer
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; progress: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0
  });

  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(nextPrayer.time).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Estimate progress between previous and next prayer (assume typical ~3-4 hours if current unavailable)
      const prevTime = currentPrayer ? new Date(currentPrayer.time).getTime() : target - 3.5 * 3600 * 1000;
      const totalSpan = Math.max(1000, target - prevTime);
      const elapsed = Math.max(0, now - prevTime);
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setTimeLeft({
        hours,
        minutes,
        seconds,
        progress: progressPercent
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, currentPrayer]);

  if (!nextPrayer) {
    return null;
  }

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/30 border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header inside Card */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Next Prayer
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-300">
          <Clock size={11} className="text-emerald-400" />
          <span>At {nextPrayer.timeString}</span>
        </div>
      </div>

      {/* Hero Prayer Name & Arabic */}
      <div className="relative z-10 mt-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {nextPrayer.name}
            {nextPrayer.notificationEnabled && (
              <Bell size={14} className="text-emerald-400 inline" />
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentPrayer ? `Currently after ${currentPrayer.name}` : 'Preparing for prayer'}
          </p>
        </div>
        <span className="arabic-text text-3xl font-bold text-emerald-400/80 drop-shadow">
          {nextPrayer.arabicName}
        </span>
      </div>

      {/* Countdown Digits */}
      <div className="relative z-10 mt-5 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-center gap-3">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black tracking-tight text-white font-mono bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
              {padZero(timeLeft.hours)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1">
              Hours
            </span>
          </div>

          <span className="text-2xl font-bold text-emerald-400 animate-pulse -mt-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black tracking-tight text-white font-mono bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
              {padZero(timeLeft.minutes)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1">
              Mins
            </span>
          </div>

          <span className="text-2xl font-bold text-emerald-400 animate-pulse -mt-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black tracking-tight text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-inner">
              {padZero(timeLeft.seconds)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80 mt-1">
              Secs
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-1000 relative"
              style={{ width: `${timeLeft.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
            <span>{currentPrayer?.name || 'Previous'}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles size={10} className="text-amber-400" />
              {Math.round(timeLeft.progress)}% elapsed
            </span>
            <span>{nextPrayer.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
