import React from 'react';
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
  Sliders
} from 'lucide-react';
import { PrayerItem, PrayerName, CalculationMethodKey } from '../../types/prayer';

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

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      {/* Table Section Header */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            Today's Prayers
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated via {calculationMethod}
          </p>
        </div>

        <button
          onClick={onOpenSettingsTab}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
          title="Configure calculation method and juristic school"
        >
          <Sliders size={12} strokeWidth={2} />
          <span>Change Method</span>
        </button>
      </div>

      {/* Unified prayer rows with subtle row dividers */}
      <div className="divide-y divide-slate-100">
        {prayers.map((prayer) => {
          const isNext = prayer.isNext;
          const isPassed = prayer.isPassed;
          const isSunrise = prayer.id === 'Sunrise';

          return (
            <div
              key={prayer.id}
              className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all ${
                isNext
                  ? 'bg-emerald-50/90 border border-emerald-300/80 my-1 shadow-xs font-medium'
                  : 'hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              {/* Left Column: Icon + Prayer Name + Arabic */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
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
                    className={`text-sm tracking-tight ${
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
                    className={`arabic-text text-xs ${
                      isNext ? 'text-emerald-800 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {prayer.arabicName}
                  </span>

                  {isSunrise && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Shurooq
                    </span>
                  )}

                  {isNext && (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                      Next
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Status Tag, Time, Notification Toggle */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Status indicator */}
                <div className="text-right hidden sm:block">
                  {isPassed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Check size={12} strokeWidth={2.5} className="text-emerald-600" />
                      Completed
                    </span>
                  ) : isNext ? (
                    <span className="text-xs font-semibold text-emerald-800">
                      Upcoming
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-slate-400">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Scheduled time */}
                <span 
                  className={`font-mono text-sm tracking-tight w-20 text-right ${
                    isNext ? 'font-bold text-base text-emerald-950' : isPassed ? 'font-normal text-slate-400' : 'font-semibold text-slate-900'
                  }`}
                >
                  {prayer.timeString}
                </span>

                {/* Notification Bell Toggle */}
                {!isSunrise ? (
                  <button
                    onClick={() => onToggleNotification(prayer.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      prayer.notificationEnabled
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={prayer.notificationEnabled ? `Mute ${prayer.name} reminder` : `Enable ${prayer.name} reminder`}
                    aria-label={prayer.notificationEnabled ? `Mute ${prayer.name} reminder` : `Enable ${prayer.name} reminder`}
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
