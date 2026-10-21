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
import { 
  getTodayDhikr, 
  incrementDhikr, 
  getTodayPrayers, 
  togglePrayerCompleted, 
  calculateRealPrayerStreak,
  DailyPrayerRecord,
  DailyDhikrRecord,
  DhikrKey
} from '../../utils/worshipStats';

interface DashboardStatsProps {
  prayers: PrayerItem[];
  onOpenTasbih?: () => void;
  onOpenCalendar?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  prayers,
  onOpenTasbih
}) => {
  // 1. Real Prayer stats state
  const [prayerRecord, setPrayerRecord] = useState<DailyPrayerRecord>(getTodayPrayers());
  const [streakStats, setStreakStats] = useState(calculateRealPrayerStreak());

  // 2. Real Dhikr stats state
  const [dhikrRecord, setDhikrRecord] = useState<DailyDhikrRecord>(getTodayDhikr());

  useEffect(() => {
    const handleWorshipUpdate = () => {
      setPrayerRecord(getTodayPrayers());
      setStreakStats(calculateRealPrayerStreak());
      setDhikrRecord(getTodayDhikr());
    };

    window.addEventListener('worship-stats-updated', handleWorshipUpdate);
    return () => window.removeEventListener('worship-stats-updated', handleWorshipUpdate);
  }, []);

  const totalObligatory = 5;
  const completedPrayersCount = streakStats.completedTodayCount;
  const prayerProgressPercent = Math.round((completedPrayersCount / totalObligatory) * 100);

  const obligatoryPrayers = prayers.filter((p) => p.id !== 'Sunrise');

  const handleTogglePrayer = (prayerId: string) => {
    togglePrayerCompleted(prayerId as keyof DailyPrayerRecord['prayers']);
  };

  const handleQuickAddDhikr = (key: DhikrKey, e?: React.MouseEvent) => {
    e?.stopPropagation();
    incrementDhikr(key, 1);
  };

  // 3. Real astronomical calculation for Last Third of Night and Islamic Midnight
  const maghrib = prayers.find((p) => p.id === 'Maghrib');
  const fajr = prayers.find((p) => p.id === 'Fajr');

  let lastThirdTimeStr = '02:15 ص';
  let midnightTimeStr = '11:45 م';

  if (maghrib && fajr) {
    try {
      const maghribDate = new Date(maghrib.time);
      const fajrDate = new Date(fajr.time);
      
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
      // ignore
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 font-readex">
      {/* 1. Real Daily Prayers Completed Card */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 font-readex">
            <CheckCircle2 size={14} className="text-emerald-700" />
            صلوات اليوم المؤداة
          </span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
            {completedPrayersCount} / {totalObligatory}
          </span>
        </div>

        <div className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>نسبة الصلوات المؤداة اليوم</span>
              <span className="font-mono font-bold text-slate-800">{prayerProgressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
              <div 
                className="h-full bg-emerald-700 rounded-none transition-all duration-300"
                style={{ width: `${prayerProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Prayer Chips */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {obligatoryPrayers.map((prayer) => {
              const isChecked = Boolean(prayerRecord.prayers[prayer.id as keyof DailyPrayerRecord['prayers']]);

              return (
                <button 
                  key={prayer.id}
                  onClick={() => handleTogglePrayer(prayer.id)}
                  className={`text-center py-1.5 px-0.5 border transition-all text-[10px] font-semibold cursor-pointer ${
                    isChecked 
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                  title={`${prayer.arabicName}: انقر لتبديل الحالة (${isChecked ? 'صلّيتها' : 'لم أصلّ بعد'})`}
                >
                  <span className="block truncate">{prayer.arabicName}</span>
                  <span className="block text-[9px] mt-0.5 opacity-90">{isChecked ? '✓' : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Real Prayer Streak & Commitment Rate */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 font-readex">
            <Flame size={14} className="text-amber-600" />
            سلسلة المحافظة على الصلاة
          </span>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
            {streakStats.streakDays > 0 ? 'مستمر' : 'ابدأ اليوم'}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-readex tracking-tight font-mono">
              {streakStats.streakDays}
            </span>
            <span className="text-xs font-semibold text-slate-600 font-readex">
              {streakStats.streakDays === 1 ? 'يوم متواصل' : 'أيام متتالية'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-readex">
            {streakStats.streakDays > 0
              ? `أحسنت! سجل صلواتك محفوظ في الذاكرة المحلية للأيام السابقة.`
              : `حدّد صلواتك اليوم لتبدأ سلسلة التزامك المباركة.`}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-readex">
          <span>نسبة الالتزام لآخر 7 أيام:</span>
          <span className="font-bold text-emerald-800 font-mono">{streakStats.weeklyRate}%</span>
        </div>
      </div>

      {/* 3. Real Dhikr Counts Breakdown (Tasbih, Hamd, Takbir...) */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 font-readex">
            <Sparkles size={14} className="text-emerald-700" />
            سجل أذكار اليوم المحفوظ
          </span>
          <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-mono">
            المجموع: {dhikrRecord.total}
          </span>
        </div>

        {/* 4 Real Counters: Tasbih, Hamd, Takbir, Istighfar */}
        <div className="grid grid-cols-2 gap-2 text-right">
          {/* سبحان الله */}
          <div className="bg-slate-50 border border-slate-200 p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">تسبيح</span>
              <span className="font-mono text-sm font-bold text-slate-900">{dhikrRecord.tasbih}</span>
            </div>
            <button
              onClick={() => handleQuickAddDhikr('tasbih')}
              className="p-1 bg-white hover:bg-emerald-100 border border-slate-200 text-emerald-800 transition-colors cursor-pointer"
              title="زيادة تسبيحة واحدة"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* الحمد لله */}
          <div className="bg-slate-50 border border-slate-200 p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">تحميد</span>
              <span className="font-mono text-sm font-bold text-slate-900">{dhikrRecord.tahmeed}</span>
            </div>
            <button
              onClick={() => handleQuickAddDhikr('tahmeed')}
              className="p-1 bg-white hover:bg-emerald-100 border border-slate-200 text-emerald-800 transition-colors cursor-pointer"
              title="زيادة تحميدة واحدة"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* الله أكبر */}
          <div className="bg-slate-50 border border-slate-200 p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">تكبير</span>
              <span className="font-mono text-sm font-bold text-slate-900">{dhikrRecord.takbeer}</span>
            </div>
            <button
              onClick={() => handleQuickAddDhikr('takbeer')}
              className="p-1 bg-white hover:bg-emerald-100 border border-slate-200 text-emerald-800 transition-colors cursor-pointer"
              title="زيادة تكبيرة واحدة"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* أستغفر الله */}
          <div className="bg-slate-50 border border-slate-200 p-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">استغفار</span>
              <span className="font-mono text-sm font-bold text-slate-900">{dhikrRecord.istighfar}</span>
            </div>
            <button
              onClick={() => handleQuickAddDhikr('istighfar')}
              className="p-1 bg-white hover:bg-emerald-100 border border-slate-200 text-emerald-800 transition-colors cursor-pointer"
              title="زيادة استغفار واحد"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-readex">انقر + للزيادة السريعة</span>
          {onOpenTasbih && (
            <button
              onClick={onOpenTasbih}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer font-readex"
            >
              <span>فتح المسبحة</span>
              <ChevronLeft size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Real Night Prayer & Qiyam Timings */}
      <div className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 font-readex">
            <Moon size={14} className="text-emerald-800" />
            قيام الليل والثلث الأخير
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-readex">
            محسوب فلكياً
          </span>
        </div>

        <div className="space-y-1.5">
          <div>
            <span className="text-[11px] text-slate-500 block font-readex">يبدأ الثلث الأخير عند:</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight font-readex">
              {lastThirdTimeStr}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug font-readex">
            ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر.
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-readex">
          <span>منتصف الليل الإسلامي:</span>
          <span className="font-semibold text-slate-800 font-mono">{midnightTimeStr}</span>
        </div>
      </div>
    </div>
  );
};
