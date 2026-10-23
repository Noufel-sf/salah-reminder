import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, X } from 'lucide-react';
import { PrayerItem } from '../../types/prayer';

interface IqamahCountdownBannerProps {
  currentPrayer: PrayerItem | null;
  iqamahMinutes: number;
  onDismiss?: () => void;
  onOpenDuas?: () => void;
}

export const IqamahCountdownBanner: React.FC<IqamahCountdownBannerProps> = ({
  currentPrayer,
  iqamahMinutes,
  onDismiss,
  onOpenDuas
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    totalSecondsLeft: number;
    progress: number;
    isFinished: boolean;
  } | null>(null);

  useEffect(() => {
    if (!currentPrayer || iqamahMinutes <= 0) {
      setTimeLeft(null);
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const prayerTime = new Date(currentPrayer.time).getTime();
      const iqamahTargetTime = prayerTime + iqamahMinutes * 60 * 1000;
      const totalSpan = iqamahMinutes * 60 * 1000;
      const remainingMs = iqamahTargetTime - now;

      if (remainingMs <= 0) {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          totalSecondsLeft: 0,
          progress: 100,
          isFinished: true
        });
        return;
      }

      const totalSecondsLeft = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSecondsLeft / 60);
      const seconds = totalSecondsLeft % 60;
      const elapsed = totalSpan - remainingMs;
      const progress = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setTimeLeft({
        minutes,
        seconds,
        totalSecondsLeft,
        progress,
        isFinished: false
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [currentPrayer, iqamahMinutes]);

  if (!currentPrayer || !timeLeft) return null;

  return (
    <div className="bg-[#19392c] border-2 border-[#19392c]/40 p-4 sm:p-5 text-white shadow-lg rounded-none relative overflow-hidden font-readex animate-fade-in">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#19392c]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#19392c]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left / Main info */}
        <div className="flex items-start gap-3.5 w-full md:w-auto">
          <div className="w-12 h-12 bg-emerald-900/80 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-sm">
            <Clock size={24} className="animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
                مؤقت الإقامة الرسمي
              </span>
              <span className="text-sm font-bold text-slate-100">
                إقامة {currentPrayer.name}
              </span>
            </div>

            <p className="text-xs text-emerald-200/90 font-readex leading-relaxed">
              {timeLeft.isFinished
                ? 'حان الآن موعد إقامة الصلاة في المسجد، أقم الصلاة يرحمك الله.'
                : '«الدُّعَاءُ لَا يُرَدُّ بَيْنَ الأَذَانِ وَالإِقَامَةِ» — اغتنم هذا الوقت المبارك بالدعاء والسنن الراتبة.'}
            </p>
          </div>
        </div>

        {/* Center / Countdown clock */}
        <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 border border-emerald-500/30">
          <div className="text-center">
            <span className="block text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
              {timeLeft.isFinished ? 'حالة الإقامة' : 'الوقت المتبقي'}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-wider">
              {timeLeft.isFinished
                ? 'حان الوقت'
                : `${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`}
            </span>
          </div>

          {!timeLeft.isFinished && (
            <div className="text-[11px] text-slate-300 hidden sm:block border-r border-emerald-500/30 pr-3">
              <div>الإجمالي: {iqamahMinutes} دقيقة</div>
              <div className="text-emerald-400 font-bold">{Math.round(timeLeft.progress)}% انقضى</div>
            </div>
          )}
        </div>

        {/* Right / Quick action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {onOpenDuas && (
            <button
              type="button"
              onClick={onOpenDuas}
              className="px-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-500/40 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <BookOpen size={13} />
              <span>أدعية الأذان والإقامة</span>
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs cursor-pointer transition-colors"
              title="إخفاء مؤقت الإقامة"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!timeLeft.isFinished && (
        <div className="w-full bg-[#19392c]/50 h-1.5 mt-3.5 border border-[#19392c]/20 overflow-hidden">
          <div
            className="bg-green-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${timeLeft.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
