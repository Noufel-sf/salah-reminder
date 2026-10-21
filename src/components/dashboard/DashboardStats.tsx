import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Moon, 
  ChevronLeft,
  Plus
} from 'lucide-react';
import { PrayerItem } from '../../types/prayer';

interface DashboardStatsProps {
  prayers: PrayerItem[];
  onOpenTasbih?: () => void;
  onOpenCalendar?: () => void;
}

const DHIKR_STORAGE_KEY = 'noor_daily_dhikr_count';
const STREAK_STORAGE_KEY = 'noor_prayer_streak';

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  prayers,
  onOpenTasbih
}) => {
  // 1. Calculate Obligatory Prayers (excluding Sunrise)
  const obligatoryPrayers = prayers.filter((p) => p.id !== 'Sunrise');
  const passedCount = obligatoryPrayers.filter((p) => p.isPassed).length;
  const totalObligatory = 5;
  const progressPercent = Math.round((passedCount / totalObligatory) * 100);

  // 2. Dhikr Count state (synced with localStorage)
  const [dhikrCount, setDhikrCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const dhikrGoal = 300;
  const dhikrPercent = Math.min(100, Math.round((dhikrCount / dhikrGoal) * 100));

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
        if (saved) setDhikrCount(parseInt(saved, 10));
      } catch {
        // ignore
      }
    };
    window.addEventListener('dhikr-updated', handleUpdate);
    return () => window.removeEventListener('dhikr-updated', handleUpdate);
  }, []);

  const handleQuickDhikr = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = dhikrCount + 10;
    setDhikrCount(next);
    localStorage.setItem(DHIKR_STORAGE_KEY, next.toString());
  };

  // 3. Streak state
  const [streakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STREAK_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });

  // 4. Calculate Qiyam & Last Third of Night
  const maghrib = prayers.find((p) => p.id === 'Maghrib');
  const fajr = prayers.find((p) => p.id === 'Fajr');

  let lastThirdTimeStr = '02:15 ص';
  let midnightTimeStr = '11:45 م';

  if (maghrib && fajr) {
    try {
      const maghribDate = new Date(maghrib.time);
      const fajrDate = new Date(fajr.time);
      
      // If fajr is earlier today than maghrib, add 24 hours for tomorrow's fajr
      let fajrNext = fajrDate.getTime();
      if (fajrNext <= maghribDate.getTime()) {
        fajrNext += 24 * 60 * 60 * 1000;
      }
      
      const nightDurationMs = fajrNext - maghribDate.getTime();
      const lastThirdMs = maghribDate.getTime() + (nightDurationMs * 2) / 3;
      const midnightMs = maghribDate.getTime() + nightDurationMs / 2;

      const formatTime = (d: Date) => {
        return d.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };

      lastThirdTimeStr = formatTime(new Date(lastThirdMs));
      midnightTimeStr = formatTime(new Date(midnightMs));
    } catch {
      // fallback defaults
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-readex">
      {/* 1. Daily Prayers Completion */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-700" />
            صلوات اليوم المفروضة
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            {passedCount} / {totalObligatory}
          </span>
        </div>

        <div className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>نسبة الصلوات المنقضية</span>
              <span className="font-mono font-bold text-slate-800">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
              <div 
                className="h-full bg-emerald-700 rounded-none transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5 Prayers Mini Chips */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {obligatoryPrayers.map((prayer) => {
              const isPassed = prayer.isPassed;
              const isNext = prayer.isNext;

              return (
                <div 
                  key={prayer.id}
                  className={`text-center py-1 border transition-colors text-[10px] font-semibold ${
                    isPassed 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : isNext 
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                  title={`${prayer.arabicName}: ${prayer.timeString} (${isPassed ? 'مضت' : isNext ? 'القادمة' : 'متبقية'})`}
                >
                  <span className="block truncate">{prayer.arabicName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Prayer Streak & Consistency */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Flame size={14} className="text-amber-600" />
            سلسلة الالتزام بالصلاة
          </span>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
            ممتاز
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-readex tracking-tight">
              {streakDays}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              يوماً متتالياً
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            محافظ على أداء الصلوات في وقتها للأسبوع الثاني على التوالي، بارك الله في عملك.
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>نسبة الالتزام الأسبوعي:</span>
          <span className="font-bold text-emerald-700 font-mono">96%</span>
        </div>
      </div>

      {/* 3. Daily Dhikr & Tasbih */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-700" />
            تسبيحات وأذكار اليوم
          </span>
          <button
            onClick={handleQuickDhikr}
            className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-0.5"
            title="إضافة 10 تسبيحات سريعة"
          >
            <Plus size={10} />
            <span>10+</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-emerald-900 font-readex tracking-tight">
                {dhikrCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {dhikrGoal}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100">
              {dhikrPercent}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-emerald-600 to-emerald-800 rounded-none transition-all duration-300"
              style={{ width: `${dhikrPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">الهدف: 300 تسبيحة</span>
          {onOpenTasbih && (
            <button
              onClick={onOpenTasbih}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer"
            >
              <span>المسبحة</span>
              <ChevronLeft size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Qiyam & Night Prayer */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Moon size={14} className="text-indigo-600" />
            قيام الليل والثلث الأخير
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200">
            وقت استجابة
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[11px] text-slate-500 block">يبدأ الثلث الأخير عند:</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight font-readex">
              {lastThirdTimeStr}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر.
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>منتصف الليل:</span>
          <span className="font-semibold text-slate-800 font-mono">{midnightTimeStr}</span>
        </div>
      </div>
    </div>
  );
};
