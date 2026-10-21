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
    progress: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
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

      const prevTime = currentPrayer ? new Date(currentPrayer.time).getTime() : target - 3.5 * 3600 * 1000;
      const totalSpan = Math.max(1000, target - prevTime);
      const elapsed = Math.max(0, now - prevTime);
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setCountdown({
        hours,
        minutes,
        seconds,
        progress: progressPercent
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, currentPrayer]);

  if (!nextPrayer) return null;

  const getRelativeText = () => {
    if (countdown.hours === 0 && countdown.minutes === 0) {
      return `يحين موعد الأذان خلال ${countdown.seconds} ثانية`;
    }
    if (countdown.hours === 0) {
      return `يحين موعد الأذان خلال ${countdown.minutes} دقيقة`;
    }
    return `يحين موعد الأذان خلال ${countdown.hours} ساعة و ${countdown.minutes} دقيقة`;
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-l from-[#113829] via-[#164e3c] to-[#205c47] rounded-none p-7 text-white shadow-md relative overflow-hidden select-none">
      {/* Decorative ambient radial glow */}
      <div className="absolute -left-8 -top-8 w-64 h-64 bg-emerald-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-none bg-white/15 text-emerald-100 border border-white/15 font-readex">
              الصلاة القادمة
            </span>
            {nextPrayer.notificationEnabled && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-none font-readex">
                <Bell size={11} strokeWidth={2.2} />
                <span>التنبيه مفعّل</span>
              </span>
            )}
          </div>

          {/* Live countdown pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-black/25 border border-white/15 font-mono text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
            <span>{padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}</span>
          </div>
        </div>

        {/* Center: Prayer Name & Scheduled Time */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 my-2">
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-extrabold tracking-tight text-white font-readex">
              {nextPrayer.name}
            </h3>
            <span className="text-white/40 text-xl font-light">|</span>
            <span className="font-amiri text-3xl font-bold text-emerald-200">
              {nextPrayer.arabicName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-3xl font-bold font-mono tracking-tight text-white">
            <Clock size={22} strokeWidth={2} className="text-emerald-400" />
            <span>{nextPrayer.timeString}</span>
          </div>
        </div>

        {/* Bottom: Natural Language Countdown & Progress Bar */}
        <div className="mt-5 pt-3.5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-emerald-100 mb-2 font-readex">
            <span className="font-medium">{getRelativeText()}</span>
            <span className="text-[11px] text-white/70 font-mono">
              مضى {Math.round(countdown.progress)}%
            </span>
          </div>

          {/* Progress bar track */}
          <div className="h-1.5 w-full bg-black/30 rounded-none overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-emerald-400 to-teal-200 rounded-none transition-all duration-1000 ease-out"
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
