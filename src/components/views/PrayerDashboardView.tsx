import React from 'react';
import { PrayerItem, PrayerName, AppSettings } from '../../types/prayer';
import { calculateQibla, DEFAULT_IQAMAH_MINUTES } from '../../utils/prayerTimes';
import { NextPrayerHero } from '../dashboard/NextPrayerHero';
import { IqamahCountdownBanner } from '../dashboard/IqamahCountdownBanner';
import { DashboardStats } from '../dashboard/DashboardStats';
import { PrayerScheduleTable } from '../dashboard/PrayerScheduleTable';
import { DailyEncouragement } from '../dashboard/DailyEncouragement';
import { DailyVerseCard } from '../dashboard/DailyVerseCard';
import { TasbihCard } from '../dashboard/TasbihCard';
import { QiblaShortcutCard } from '../dashboard/QiblaShortcutCard';
import { JumuahModeCard } from '../dashboard/JumuahModeCard';

interface PrayerDashboardViewProps {
  prayers: PrayerItem[];
  nextPrayer: PrayerItem | null;
  currentPrayer: PrayerItem | null;
  settings: AppSettings;
  onToggleNotification: (prayerId: PrayerName) => void;
  onOpenQiblaTab: () => void;
  onOpenSettingsTab: () => void;
  onOpenTasbihTab?: () => void;
  onOpenDuasTab?: () => void;
  onOpenQuranTab?: () => void;
  onOpenKahfReader?: () => void;
}

export const PrayerDashboardView: React.FC<PrayerDashboardViewProps> = ({
  prayers,
  nextPrayer,
  currentPrayer,
  settings,
  onToggleNotification,
  onOpenQiblaTab,
  onOpenSettingsTab,
  onOpenTasbihTab,
  onOpenDuasTab,
  onOpenQuranTab,
  onOpenKahfReader
}) => {
  const [dismissedIqamahPrayer, setDismissedIqamahPrayer] = React.useState<string | null>(null);
  const qiblaAngle = calculateQibla(settings.latitude, settings.longitude);
  const isFriday = new Date().getDay() === 5;

  const activeIqamahInfo = React.useMemo(() => {
    if (settings.iqamahEnabled === false || !currentPrayer || currentPrayer.id === 'Sunrise') {
      return null;
    }
    if (dismissedIqamahPrayer === currentPrayer.id) {
      return null;
    }

    const now = new Date().getTime();
    const prayerTime = new Date(currentPrayer.time).getTime();
    const diff = now - prayerTime;
    const iqamahMins = settings.iqamahDurations?.[currentPrayer.id] ?? DEFAULT_IQAMAH_MINUTES[currentPrayer.id] ?? 15;

    // Show banner from 0 to (iqamahMins + 5) minutes after adhan
    if (diff >= 0 && diff <= (iqamahMins + 5) * 60 * 1000) {
      return {
        prayer: currentPrayer,
        minutes: iqamahMins
      };
    }
    return null;
  }, [settings.iqamahEnabled, settings.iqamahDurations, currentPrayer, dismissedIqamahPrayer]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Next Prayer Hero Section */}
      <NextPrayerHero
        nextPrayer={nextPrayer}
        currentPrayer={currentPrayer}
      />

      {/* 1.5 Active Iqamah Countdown Banner */}
      {activeIqamahInfo && (
        <IqamahCountdownBanner
          currentPrayer={activeIqamahInfo.prayer}
          iqamahMinutes={activeIqamahInfo.minutes}
          onDismiss={() => setDismissedIqamahPrayer(activeIqamahInfo.prayer.id)}
          onOpenDuas={onOpenDuasTab}
        />
      )}

      {/* Friday Blessed Jumu'ah Mode Card */}
      {isFriday && (
        <JumuahModeCard
          prayers={prayers}
          onOpenKahfReader={onOpenKahfReader || (() => {})}
          salawatGoal={settings.jumuahSalawatGoal || 300}
        />
      )}

      {/* 2. Key Worship & Prayer Statistics (Real Adhkar stats) */}
      <DashboardStats
        onOpenTasbih={onOpenTasbihTab}
        onOpenDuas={onOpenDuasTab}
      />

      {/* 3. Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Schedule Column (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <PrayerScheduleTable
            prayers={prayers}
            calculationMethod={settings.calculationMethod}
            onToggleNotification={onToggleNotification}
            onOpenSettingsTab={onOpenSettingsTab}
          />

          <DailyEncouragement />
        </div>

        {/* Right Supporting Panel (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          <DailyVerseCard onOpenQuranTab={onOpenQuranTab} />
          <TasbihCard />
          <QiblaShortcutCard
            qiblaAngle={qiblaAngle}
            cityName={settings.city}
            onOpenQiblaTab={onOpenQiblaTab}
          />
        </div>
      </div>
    </div>
  );
};
