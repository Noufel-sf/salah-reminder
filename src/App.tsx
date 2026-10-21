import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppSidebar, NavTab } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
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

  useEffect(() => {
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleSaveSettings({ ...settings, theme: nextTheme });
  };

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

  const handleToggleMute = () => {
    const nextSound = settings.soundOption === 'silent' ? 'takbeer' : 'silent';
    handleSaveSettings({ ...settings, soundOption: nextSound });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerData = useMemo(() => {
    return calculatePrayerTimes(settings, currentTime);
  }, [settings, currentTime.toDateString()]);

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
              `حيّ على الصلاة - ${prayer.name}`,
              `حان الآن وقت ${prayer.name} في مدينة ${settings.city}.`
            );
          } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`حان الآن وقت ${prayer.name}`, {
              body: `حان موعد صلاة ${prayer.name} في مدينة ${settings.city}.`
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
          title: 'مواقيت الصلاة',
          subtitle: 'أوقات الصلوات اليومية بدقة مع التنبيهات'
        };
      case 'qibla':
        return {
          title: 'اتجاه القبلة',
          subtitle: 'تحديد دقيق لاتجاه الكعبة المشرفة بمكة المكرمة'
        };
      case 'tasbih':
        return {
          title: 'المسبحة الإلكترونية',
          subtitle: 'عدّ الأذكار اليومية واجعل لسانك رطباً بذكر الله'
        };
      case 'duas':
        return {
          title: 'الأذكار والحديث',
          subtitle: 'أذكار الصباح والمساء والأدعية النبوية المأثورة'
        };
      case 'calendar':
        return {
          title: 'التقويم الهجري',
          subtitle: 'متابعة التاريخ القمري والمناسبات والأيام المباركة'
        };
      case 'settings':
        return {
          title: 'الإعدادات والتفضيلات',
          subtitle: 'ضبط الموقع وطريقة الحساب وأصوات الأذان والتنبيهات'
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none bg-[#f8faf8] text-slate-900 font-readex">
      {/* Left Application Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        settings={settings}
        onOpenSettingsLocation={() => setCurrentTab('settings')}
        onToggleMute={handleToggleMute}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <AppHeader 
          title={headerInfo.title} 
          subtitle={headerInfo.subtitle}
          cityName={settings.city}
          countryName={settings.country}
          onOpenLocationSettings={() => setCurrentTab('settings')}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-[#f8faf8]">
          {currentTab === 'prayers' && (
            <PrayerDashboardView
              prayers={prayerData.prayers}
              nextPrayer={prayerData.nextPrayer}
              currentPrayer={prayerData.currentPrayer}
              settings={settings}
              onToggleNotification={handleToggleNotification}
              onOpenQiblaTab={() => setCurrentTab('qibla')}
              onOpenSettingsTab={() => setCurrentTab('settings')}
              onOpenTasbihTab={() => setCurrentTab('tasbih')}
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
