import React, { useState, useEffect } from 'react';
import { 
  Sunrise, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  Check, 
  Bell, 
  BellOff, 
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PrayerItem, PrayerName, CalculationMethodKey } from '../../types/prayer';
import { CALCULATION_METHOD_LABELS_AR } from '../../utils/prayerTimes';
import { getTodayPrayers, togglePrayerCompleted, DailyPrayerRecord } from '../../utils/worshipStats';

interface PrayerScheduleTableProps {
  prayers: PrayerItem[];
  calculationMethod: CalculationMethodKey;
  onToggleNotification: (prayerId: PrayerName) => void;
  onOpenSettingsTab: () => void;
}

export const PrayerScheduleTable: React.FC<PrayerScheduleTableProps> = ({
  prayers,
  calculationMethod,
  onToggleNotification,
  onOpenSettingsTab
}) => {
  const [prayerRecord, setPrayerRecord] = useState<DailyPrayerRecord>(getTodayPrayers());

  useEffect(() => {
    const handleUpdate = () => {
      setPrayerRecord(getTodayPrayers());
    };
    window.addEventListener('worship-stats-updated', handleUpdate);
    return () => window.removeEventListener('worship-stats-updated', handleUpdate);
  }, []);
  const getPrayerIcon = (id: PrayerName) => {
    switch (id) {
      case 'Fajr':
        return <Moon size={16} strokeWidth={2} />;
      case 'Sunrise':
        return <Sunrise size={16} strokeWidth={2} />;
      case 'Dhuhr':
        return <Sun size={16} strokeWidth={2} />;
      case 'Asr':
        return <SunMedium size={16} strokeWidth={2} />;
      case 'Maghrib':
        return <Sunset size={16} strokeWidth={2} />;
      case 'Isha':
        return <Moon size={16} strokeWidth={2} />;
      default:
        return <Sparkles size={16} strokeWidth={2} />;
    }
  };

  const methodNameArabic = CALCULATION_METHOD_LABELS_AR[calculationMethod] || calculationMethod;

  return (
    <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm">
      {/* Table Section Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
        <div className="text-right">
          <h3 className="text-base font-bold tracking-tight text-slate-900 font-readex">
            صلوات اليوم
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-readex">
            حسب طريقة: {methodNameArabic}
          </p>
        </div>

        <button
          onClick={onOpenSettingsTab}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-none border border-slate-200 bg-slate-50/80 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer font-readex"
          title="تغيير طريقة الحساب والمذهب الفقهي"
        >
          <Sliders size={12} strokeWidth={2} />
          <span>تعديل الطريقة</span>
        </button>
      </div>

      {/* Unified prayer rows */}
      <div className="divide-y divide-slate-100">
        {prayers.map((prayer) => {
          const isNext = prayer.isNext;
          const isPassed = prayer.isPassed;
          const isSunrise = prayer.id === 'Sunrise';

          return (
            <div
              key={prayer.id}
              className={`flex items-center justify-between py-3 px-3 rounded-none transition-all ${
                isNext
                  ? 'bg-emerald-50/90 border border-emerald-300/80 my-1 shadow-xs font-medium'
                  : 'hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              {/* Right Column in RTL: Icon + Prayer Name + Arabic */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div 
                  className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 transition-colors ${
                    isNext
                      ? 'bg-emerald-700 text-white'
                      : isSunrise
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : isPassed
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getPrayerIcon(prayer.id)}
                </div>

                <div className="flex items-center gap-2.5 truncate">
                  <span 
                    className={`text-sm tracking-tight font-readex ${
                      isNext 
                        ? 'font-bold text-emerald-950' 
                        : isPassed 
                        ? 'font-normal text-slate-400' 
                        : 'font-semibold text-slate-900'
                    }`}
                  >
                    {prayer.name}
                  </span>

                  <span 
                    className={`font-amiri text-xs ${
                      isNext ? 'text-emerald-800 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {prayer.arabicName}
                  </span>

                  {isSunrise && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-none bg-amber-50 text-amber-700 border border-amber-200 font-readex">
                      شروق
                    </span>
                  )}

                  {isNext && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-none bg-emerald-700 text-white font-readex">
                      الصلاة القادمة
                    </span>
                  )}
                </div>
              </div>

              {/* Left Column in RTL: Status Tag, Time, Notification Toggle */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Status indicator */}
                <div className="text-left hidden sm:block font-readex">
                  {isPassed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Check size={12} strokeWidth={2.5} className="text-emerald-600" />
                      مضت
                    </span>
                  ) : isNext ? (
                    <span className="text-xs font-semibold text-emerald-800">
                      القادمة
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-slate-400">
                      متبقية
                    </span>
                  )}
                </div>

                {/* Scheduled time */}
                <span 
                  className={`font-mono text-sm tracking-tight w-24 text-left ${
                    isNext ? 'font-bold text-base text-emerald-950' : isPassed ? 'font-normal text-slate-400' : 'font-semibold text-slate-900'
                  }`}
                >
                  {prayer.timeString}
                </span>

                {/* Prayer Completion Toggle */}
                {!isSunrise && (
                  <button
                    onClick={() => togglePrayerCompleted(prayer.id as keyof DailyPrayerRecord['prayers'])}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-none border transition-all cursor-pointer font-readex ${
                      prayerRecord.prayers[prayer.id as keyof DailyPrayerRecord['prayers']]
                        ? 'bg-emerald-700 border-emerald-700 text-white font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={prayerRecord.prayers[prayer.id as keyof DailyPrayerRecord['prayers']] ? 'انقر لإلغاء التحديد' : 'تحديد كصلاة مؤداة اليوم'}
                  >
                    <CheckCircle2 size={13} strokeWidth={prayerRecord.prayers[prayer.id as keyof DailyPrayerRecord['prayers']] ? 2.5 : 1.8} />
                    <span>{prayerRecord.prayers[prayer.id as keyof DailyPrayerRecord['prayers']] ? 'صلّيتها' : 'لم أصلّ'}</span>
                  </button>
                )}

                {/* Notification Bell Toggle */}
                {!isSunrise ? (
                  <button
                    onClick={() => onToggleNotification(prayer.id)}
                    className={`p-1.5 rounded-none border transition-colors cursor-pointer ${
                      prayer.notificationEnabled
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={prayer.notificationEnabled ? `تعطيل تنبيه ${prayer.name}` : `تفعيل تنبيه ${prayer.name}`}
                    aria-label={prayer.notificationEnabled ? `تعطيل تنبيه ${prayer.name}` : `تفعيل تنبيه ${prayer.name}`}
                  >
                    {prayer.notificationEnabled ? (
                      <Bell size={13} strokeWidth={2.2} />
                    ) : (
                      <BellOff size={13} strokeWidth={2} />
                    )}
                  </button>
                ) : (
                  <div className="w-7 h-7" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
