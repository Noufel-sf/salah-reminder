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
    <div 
      className="pro-card p-6 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Table Section Header */}
      <div 
        className="flex items-center justify-between pb-4 mb-2 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div>
          <h3 
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Today's Prayers
          </h3>
          <p 
            className="text-xs mt-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Calculated via {calculationMethod}
          </p>
        </div>

        <button
          onClick={onOpenSettingsTab}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer hover:underline"
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-primary)'
          }}
          title="Configure calculation method and juristic school"
        >
          <Sliders size={12} strokeWidth={2} />
          <span>Change Method</span>
        </button>
      </div>

      {/* Unified clean prayer rows with subtle row dividers */}
      <div className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {prayers.map((prayer) => {
          const isNext = prayer.isNext;
          const isPassed = prayer.isPassed;
          const isSunrise = prayer.id === 'Sunrise';

          return (
            <div
              key={prayer.id}
              className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all ${
                isNext
                  ? 'my-1 shadow-xs font-medium'
                  : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.02]'
              }`}
              style={{
                backgroundColor: isNext ? 'var(--color-primary-highlight)' : 'transparent',
                border: isNext ? '1px solid rgba(21, 92, 69, 0.2)' : '1px solid transparent'
              }}
            >
              {/* Left Column: Icon + Prayer Name + Arabic */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: isNext 
                      ? 'var(--color-primary)' 
                      : isSunrise 
                      ? 'var(--color-gold-soft)' 
                      : 'var(--color-surface-muted)',
                    color: isNext 
                      ? '#FFFFFF' 
                      : isSunrise 
                      ? 'var(--color-gold)' 
                      : isPassed 
                      ? 'var(--color-text-tertiary)' 
                      : 'var(--color-text-secondary)'
                  }}
                >
                  {getPrayerIcon(prayer.id)}
                </div>

                <div className="flex items-center gap-2.5 truncate">
                  <span 
                    className={`text-sm tracking-tight ${
                      isNext 
                        ? 'font-bold' 
                        : isPassed 
                        ? 'font-normal' 
                        : 'font-semibold'
                    }`}
                    style={{
                      color: isNext 
                        ? 'var(--color-primary)' 
                        : isPassed 
                        ? 'var(--color-text-tertiary)' 
                        : 'var(--color-text-primary)'
                    }}
                  >
                    {prayer.name}
                  </span>

                  <span 
                    className="arabic-text text-xs"
                    style={{
                      color: isNext 
                        ? 'var(--color-primary)' 
                        : 'var(--color-text-tertiary)'
                    }}
                  >
                    {prayer.arabicName}
                  </span>

                  {isSunrise && (
                    <span 
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--color-gold-soft)',
                        borderColor: 'rgba(198, 161, 91, 0.25)',
                        color: 'var(--color-gold)'
                      }}
                    >
                      Shurooq
                    </span>
                  )}

                  {isNext && (
                    <span 
                      className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
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
                    <span 
                      className="inline-flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      <Check size={12} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} />
                      Completed
                    </span>
                  ) : isNext ? (
                    <span 
                      className="text-xs font-semibold"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Upcoming
                    </span>
                  ) : (
                    <span 
                      className="text-xs font-normal"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Scheduled time with tabular alignment */}
                <span 
                  className={`font-mono text-sm tracking-tight w-20 text-right ${
                    isNext ? 'font-bold text-base' : isPassed ? 'font-normal' : 'font-semibold'
                  }`}
                  style={{
                    color: isNext 
                      ? 'var(--color-primary)' 
                      : isPassed 
                      ? 'var(--color-text-tertiary)' 
                      : 'var(--color-text-primary)'
                  }}
                >
                  {prayer.timeString}
                </span>

                {/* Notification Bell Toggle */}
                {!isSunrise ? (
                  <button
                    onClick={() => onToggleNotification(prayer.id)}
                    className="p-1.5 rounded-lg border transition-colors cursor-pointer"
                    style={{
                      backgroundColor: prayer.notificationEnabled 
                        ? 'var(--color-primary-highlight)' 
                        : 'var(--color-surface-subtle)',
                      borderColor: prayer.notificationEnabled 
                        ? 'rgba(21, 92, 69, 0.25)' 
                        : 'var(--color-border)',
                      color: prayer.notificationEnabled 
                        ? 'var(--color-primary)' 
                        : 'var(--color-text-tertiary)'
                    }}
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
                  <div className="w-7 h-7" /> // spacing placeholder for alignment
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
