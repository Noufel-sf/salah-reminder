import React from 'react';
import { PrayerItem, PrayerName, AppSettings } from '../../types/prayer';
import { calculateQibla } from '../../utils/prayerTimes';
import { NextPrayerHero } from '../dashboard/NextPrayerHero';
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
}

export const PrayerDashboardView: React.FC<PrayerDashboardViewProps> = ({
  prayers,
  nextPrayer,
  currentPrayer,
  settings,
  onToggleNotification,
  onOpenQiblaTab,
  onOpenSettingsTab
}) => {
  const qiblaAngle = calculateQibla(settings.latitude, settings.longitude);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Next Prayer Hero Section (Refined, no clipped text, no giant silhouette) */}
      <NextPrayerHero
        nextPrayer={nextPrayer}
        currentPrayer={currentPrayer}
      />

      {/* 2. Responsive 2-Column Grid: Main Schedule & Right Supporting Panel */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Main Schedule Column (Flexible, Takes Priority) */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          <PrayerScheduleTable
            prayers={prayers}
            calculationMethod={settings.calculationMethod}
            onToggleNotification={onToggleNotification}
            onOpenSettingsTab={onOpenSettingsTab}
          />

          {/* Daily Encouragement message below schedule */}
          <DailyEncouragement />
        </div>

        {/* Right Supporting Panel (320px–340px, non-intrusive, no crowding) */}
        <div className="w-full xl:w-80 shrink-0 space-y-5">
          {/* Daily Quranic Verse */}
          <DailyVerseCard />

          {/* Focused Digital Tasbih Counter */}
          <TasbihCard />

          {/* Qibla Direction Shortcut */}
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
