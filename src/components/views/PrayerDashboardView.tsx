import React from 'react';
import { PrayerItem, PrayerName, AppSettings } from '../../types/prayer';
import { calculateQibla } from '../../utils/prayerTimes';
import { NextPrayerHero } from '../dashboard/NextPrayerHero';
import { DashboardStats } from '../dashboard/DashboardStats';
import { PrayerScheduleTable } from '../dashboard/PrayerScheduleTable';
import { DailyEncouragement } from '../dashboard/DailyEncouragement';
import { DailyVerseCard } from '../dashboard/DailyVerseCard';
import { TasbihCard } from '../dashboard/TasbihCard';
import { QiblaShortcutCard } from '../dashboard/QiblaShortcutCard';

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
  onOpenDuasTab
}) => {
  const qiblaAngle = calculateQibla(settings.latitude, settings.longitude);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Next Prayer Hero Section */}
      <NextPrayerHero
        nextPrayer={nextPrayer}
        currentPrayer={currentPrayer}
      />

      {/* 2. Key Worship & Prayer Statistics (Real Adhkar stats) */}
      <DashboardStats
        onOpenTasbih={onOpenTasbihTab}
        onOpenDuas={onOpenDuasTab}
      />

      {/* 3. Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Schedule Column (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          <PrayerScheduleTable
            prayers={prayers}
            calculationMethod={settings.calculationMethod}
            onToggleNotification={onToggleNotification}
            onOpenSettingsTab={onOpenSettingsTab}
          />

          <DailyEncouragement />
        </div>

        {/* Right Supporting Panel (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-6">
          <DailyVerseCard />
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
