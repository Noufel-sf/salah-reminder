import React, { useState, useEffect } from 'react';
import { Moon, Sun, Check, Sparkles } from 'lucide-react';
import { PrayerItem } from '../../types/prayer';
import { FastingInfo } from '../../utils/prayerTimes';

interface FastingImsakIftarCardProps {
  prayers: PrayerItem[];
  fastingInfo: FastingInfo;
  isFastingToday: boolean;
  onToggleFastingToday: () => void;
}

export const FastingImsakIftarCard: React.FC<FastingImsakIftarCardProps> = ({
  prayers,
  fastingInfo,
  isFastingToday,
  onToggleFastingToday
}) => {
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isIftarPassed: boolean;
    progress: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isIftarPassed: false,
    progress: 0
  });

  const fajrPrayer = prayers.find((p) => p.id === 'Fajr');
  const maghribPrayer = prayers.find((p) => p.id === 'Maghrib');

  useEffect(() => {
    if (!maghribPrayer || !fajrPrayer) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const fajrTime = new Date(fajrPrayer.time).getTime();
      const iftarTime = new Date(maghribPrayer.time).getTime();

      const diff = iftarTime - now;

      if (diff <= 0) {
        setCountdown({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isIftarPassed: true,
          progress: 100
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const totalSpan = Math.max(1000, iftarTime - fajrTime);
      const elapsed = Math.max(0, now - fajrTime);
      const progress = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setCountdown({
        hours,
        minutes,
        seconds,
        isIftarPassed: false,
        progress
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [fajrPrayer, maghribPrayer]);

  const activeMode = isFastingToday || fastingInfo.isFastingDay;

  return (
    <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm text-right font-readex transition-all relative overflow-hidden">
      {/* Decorative ambient top border line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <Moon size={16} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-900 block font-readex">
              {fastingInfo.title || 'صيام النوافل والإمساك'}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold font-readex">
              {fastingInfo.isFastingDay ? 'سنة مؤكدة اليوم' : 'تتبع الصيام والإفطار'}
            </span>
          </div>
        </div>

        {/* Toggle Fasting Today */}
        <button
          type="button"
          onClick={onToggleFastingToday}
          className={`px-3 py-1 text-xs font-bold rounded-none border flex items-center gap-1.5 transition-all cursor-pointer font-readex ${
            isFastingToday
              ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="تفعيل أو إلغاء احتساب صيام اليوم"
        >
          {isFastingToday && <Check size={13} className="text-emerald-300" />}
          <span>{isFastingToday ? 'أنا صائم اليوم 🌙' : 'تفعيل وضع الصائم'}</span>
        </button>
      </div>

      {/* Main Countdown & Times */}
      {activeMode ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-amber-50/70 to-emerald-50/40 dark:from-amber-950/30 dark:to-emerald-950/20 border border-amber-200/70 dark:border-amber-800/40 p-4 text-center">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">
              {countdown.isIftarPassed ? 'حان وقت الإفطار' : 'الوقت المتبقي على أذان المغرب والإفطار'}
            </span>

            {countdown.isIftarPassed ? (
              <div className="space-y-1 py-1">
                <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300 font-amiri block">
                  تقبل الله صيامكم وطاعتكم 🤲
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-amiri">
                  «ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»
                </p>
              </div>
            ) : (
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-300 tracking-wider">
                {countdown.hours.toString().padStart(2, '0')}:
                {countdown.minutes.toString().padStart(2, '0')}:
                {countdown.seconds.toString().padStart(2, '0')}
              </div>
            )}

            {/* Progress Bar of Fasting Day */}
            {!countdown.isIftarPassed && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>انقضى {Math.round(countdown.progress)}% من ساعات الصيام</span>
                  <span>{fajrPrayer?.timeString} ← {maghribPrayer?.timeString}</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-black/40 h-2 border border-amber-300/40 dark:border-amber-700/40 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-600 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${countdown.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Imsak & Iftar Info Box */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Sun size={12} className="text-amber-600" />
                <span>الإمساك / الفجر:</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{fajrPrayer?.timeString || '--:--'}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Moon size={12} className="text-emerald-700" />
                <span>الإفطار / المغرب:</span>
              </span>
              <span className="font-mono font-bold text-emerald-800">{maghribPrayer?.timeString || '--:--'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed font-readex">
            {fastingInfo.virtue || '«مَنْ صَامَ يَوْماً فِي سَبِيلِ اللَّهِ بَاعَدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفاً». انقر على زر (تفعيل وضع الصائم) لبدء العد التنازلي للإفطار.'}
          </p>
        </div>
      )}

      {/* Tomorrow Reminder Banner */}
      {fastingInfo.isTomorrowFastingDay && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-700 shrink-0" />
            <span className="font-bold">{fastingInfo.tomorrowTitle}</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold">استحضر نية الصيام الليلة 🌙</span>
        </div>
      )}
    </div>
  );
};
