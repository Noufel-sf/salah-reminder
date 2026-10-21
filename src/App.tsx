import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DesktopSidebar, NavTab } from './components/DesktopSidebar';
import { DesktopTopBar } from './components/DesktopTopBar';
import { PrayerDashboardView } from './components/views/PrayerDashboardView';
import { QiblaView } from './components/views/QiblaView';
import { TasbihView } from './components/views/TasbihView';
import { DuasView } from './components/views/DuasView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';

import { AppSettings, PrayerName } from './types/prayer';
import { DEFAULT_SETTINGS, calculatePrayerTimes } from './utils/prayerTimes';
import { audioService } from './utils/audio';

const STORAGE_KEY = 'noor_prayer_settings';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('prayers');

  // Load saved settings or fallback to default
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const lastAlertedPrayerRef = useRef<string>('');

  // Save settings when changed
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Toggle individual prayer notification
  const handleToggleNotification = (prayerId: PrayerName) => {
    const updated: AppSettings = {
      ...settings,
      enabledPrayers: {
        ...settings.enabledPrayers,
        [prayerId]: !settings.enabledPrayers[prayerId]
      }
    };
    handleSaveSettings(updated);
  };

  // Quick mute toggle
  const handleToggleMute = () => {
    const nextSound = settings.soundOption === 'silent' ? 'takbeer' : 'silent';
    handleSaveSettings({ ...settings, soundOption: nextSound });
  };

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate prayer times
  const prayerData = useMemo(() => {
    return calculatePrayerTimes(settings, currentTime);
  }, [settings, currentTime.toDateString()]);

  // Check for prayer alert triggers
  useEffect(() => {
    if (!prayerData || !prayerData.prayers) return;

    const now = new Date();
    const todayStr = now.toDateString();

    prayerData.prayers.forEach((prayer) => {
      if (prayer.id === 'Sunrise') return;
      if (!settings.enabledPrayers[prayer.id]) return;

      const prayerTime = new Date(prayer.time);
      const diffMs = now.getTime() - prayerTime.getTime();

      if (diffMs >= 0 && diffMs < 45000) {
        const alertKey = `${todayStr}_${prayer.id}`;
        if (lastAlertedPrayerRef.current !== alertKey) {
          lastAlertedPrayerRef.current = alertKey;

          audioService.playSound(settings.soundOption, settings.adhanVolume);

          if (window.electronAPI) {
            window.electronAPI.showNotification(
              `Hayya 'ala-s-Salah - ${prayer.name} (${prayer.arabicName})`,
              `It is now time for ${prayer.name} prayer in ${settings.city}.`
            );
          } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Time for ${prayer.name} (${prayer.arabicName})`, {
              body: `It is now time for ${prayer.name} prayer in ${settings.city}.`
            });
          }
        }
      }
    });
  }, [currentTime, prayerData, settings]);

  const getTabHeader = () => {
    switch (currentTab) {
      case 'prayers':
        return {
          title: 'Sholat & Timetable',
          subtitle: 'Monitor daily waqt prayer times with accurate offline calculation'
        };
      case 'qibla':
        return {
          title: 'Qibla Direction',
          subtitle: 'Precise compass alignment relative to the Holy Kaaba in Mecca'
        };
      case 'tasbih':
        return {
          title: 'Digital Tasbih',
          subtitle: 'Count your daily dhikr and keep your tongue moist with remembrance'
        };
      case 'duas':
        return {
          title: 'Doa & Hadith',
          subtitle: 'Authentic prophetic morning, evening, and daily supplications'
        };
      case 'calendar':
        return {
          title: 'Islamic Calendar',
          subtitle: 'Track Hijri lunar dates, blessed nights, and upcoming Islamic milestones'
        };
      case 'settings':
        return {
          title: 'Settings & Preferences',
          subtitle: 'Configure calculation methods, location coordinates, and audio alerts'
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex h-screen w-screen bg-[#f6f8f6] text-[#132b21] overflow-hidden select-none font-sans">
      {/* Left Sidebar */}
      <DesktopSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        settings={settings}
        onOpenSettingsLocation={() => setCurrentTab('settings')}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Window Bar */}
        <DesktopTopBar title={headerInfo.title} subtitle={headerInfo.subtitle} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-[#f6f8f6]">
          {currentTab === 'prayers' && (
            <PrayerDashboardView
              prayers={prayerData.prayers}
              nextPrayer={prayerData.nextPrayer}
              currentPrayer={prayerData.currentPrayer}
              settings={settings}
              onToggleNotification={handleToggleNotification}
              onOpenQiblaTab={() => setCurrentTab('qibla')}
              onOpenSettingsTab={() => setCurrentTab('settings')}
            />
          )}

          {currentTab === 'qibla' && (
            <QiblaView settings={settings} />
          )}

          {currentTab === 'tasbih' && (
            <TasbihView />
          )}

          {currentTab === 'duas' && (
            <DuasView />
          )}

          {currentTab === 'calendar' && (
            <CalendarView />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
