import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { NextPrayerCard } from './components/NextPrayerCard';
import { PrayerList } from './components/PrayerList';
import { SettingsModal } from './components/SettingsModal';
import { QiblaModal } from './components/QiblaModal';
import { AppSettings, PrayerName } from './types/prayer';
import { DEFAULT_SETTINGS, calculatePrayerTimes } from './utils/prayerTimes';
import { audioService } from './utils/audio';

const STORAGE_KEY = 'noor_prayer_settings';

export const App: React.FC = () => {
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);

  // Track the last alerted prayer to avoid duplicate notifications
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
      if (prayer.id === 'Sunrise') return; // typically no prayer alert for sunrise
      if (!settings.enabledPrayers[prayer.id]) return;

      const prayerTime = new Date(prayer.time);
      const diffMs = now.getTime() - prayerTime.getTime();

      // Trigger if within 45 seconds after prayer time has arrived
      if (diffMs >= 0 && diffMs < 45000) {
        const alertKey = `${todayStr}_${prayer.id}`;
        if (lastAlertedPrayerRef.current !== alertKey) {
          lastAlertedPrayerRef.current = alertKey;

          // 1. Play audio
          audioService.playSound(settings.soundOption, settings.adhanVolume);

          // 2. Trigger native OS notification
          if (window.electronAPI) {
            window.electronAPI.showNotification(
              `Hayya 'ala-s-Salah - ${prayer.name} (${prayer.arabicName})`,
              `It is now time for ${prayer.name} prayer in ${settings.city}.`
            );
          } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Time for ${prayer.name} (${prayer.arabicName})`, {
              body: `It is now time for ${prayer.name} prayer in ${settings.city}.`,
              icon: '/icon.png'
            });
          }
        }
      }
    });
  }, [currentTime, prayerData, settings]);

  return (
    <div className="relative min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans select-none pb-6">
      {/* Dynamic Background Atmosphere */}
      <div className="app-atmosphere">
        <div className="atmosphere-orb-1" />
        <div className="atmosphere-orb-2" />
        <div className="atmosphere-orb-3" />
      </div>

      {/* Titlebar & Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQibla={() => setIsQiblaOpen(true)}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 pt-3 max-w-lg mx-auto w-full">
        {/* Next Prayer Hero */}
        <NextPrayerCard
          nextPrayer={prayerData.nextPrayer}
          currentPrayer={prayerData.currentPrayer}
        />

        {/* 6 Waqt Prayer Schedule List */}
        <PrayerList
          prayers={prayerData.prayers}
          onToggleNotification={handleToggleNotification}
        />

        {/* Footer info */}
        <footer className="mt-5 text-center text-[10px] text-slate-500">
          <p>Method: {settings.calculationMethod} • {settings.madhab === 'hanafi' ? 'Hanafi' : 'Standard'}</p>
          <p className="mt-0.5 text-slate-600">Noor Prayer Reminder Desktop</p>
        </footer>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Qibla Direction Compass Modal */}
      <QiblaModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
        latitude={settings.latitude}
        longitude={settings.longitude}
        cityName={settings.city}
      />
    </div>
  );
};

export default App;
