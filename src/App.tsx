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
import { incrementDhikr } from './utils/worshipStats';
import { sendDhikrNotification, DhikrReminder } from './utils/dhikrNotifications';

const STORAGE_KEY = 'noor_prayer_settings';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('prayers');

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If the stored setting was the old default Algiers coordinates, migrate to Constantine Algeria
        if (parsed.city === 'الجزائر' && Math.abs((parsed.latitude || 0) - 36.7538) < 0.05) {
          const migrated = { ...DEFAULT_SETTINGS };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const [spaceToast, setSpaceToast] = useState<{ count: number } | null>(null);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(false);
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState<string>('');
  const [activeDhikrPop, setActiveDhikrPop] = useState<DhikrReminder | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const dhikrPopTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleStarted = () => setIsAdhanPlaying(true);
    const handleStopped = () => setIsAdhanPlaying(false);
    window.addEventListener('adhan-started', handleStarted);
    window.addEventListener('adhan-stopped', handleStopped);
    return () => {
      window.removeEventListener('adhan-started', handleStarted);
      window.removeEventListener('adhan-stopped', handleStopped);
    };
  }, []);

  // Periodic & Random Dhikr Reminders Scheduler
  useEffect(() => {
    if (settings.randomDhikrEnabled === false) return;

    let timeoutId: any;

    const scheduleNext = () => {
      // If interval is 0, choose random time between 20 and 45 minutes
      // If > 0, use exact minutes
      const intervalMinutes =
        settings.randomDhikrInterval && settings.randomDhikrInterval > 0
          ? settings.randomDhikrInterval
          : 20 + Math.random() * 25;

      const delayMs = intervalMinutes * 60 * 1000;

      timeoutId = setTimeout(() => {
        sendDhikrNotification();
        scheduleNext();
      }, delayMs);
    };

    scheduleNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [settings.randomDhikrEnabled, settings.randomDhikrInterval]);

  // In-app visual notification listener
  useEffect(() => {
    const handleDhikrPop = (e: any) => {
      if (e.detail) {
        setActiveDhikrPop(e.detail);
        if (dhikrPopTimeoutRef.current) clearTimeout(dhikrPopTimeoutRef.current);
        dhikrPopTimeoutRef.current = setTimeout(() => {
          setActiveDhikrPop(null);
        }, 10000);
      }
    };

    window.addEventListener('dhikr-notification-pop', handleDhikrPop);
    return () => {
      window.removeEventListener('dhikr-notification-pop', handleDhikrPop);
      if (dhikrPopTimeoutRef.current) clearTimeout(dhikrPopTimeoutRef.current);
    };
  }, []);

  // Global Hotkey: Space for Quick Tasbih across the app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        const record = incrementDhikr('tasbih', 1);
        audioService.playBeep(0.12);

        setSpaceToast({ count: record.tasbih });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setSpaceToast(null);
        }, 1200);

        window.dispatchEvent(new CustomEvent('space-tasbih-tap'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
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

          setActiveAdhanPrayer(prayer.name);
          audioService.playSound(settings.soundOption, settings.adhanVolume, prayer.id);

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
              onOpenDuasTab={() => setCurrentTab('duas')}
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

      {/* Floating Quick Tasbih Toast Notification */}
      {spaceToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-emerald-500/60 px-5 py-2.5 shadow-2xl flex items-center gap-3 font-readex rounded-none backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 bg-emerald-400 rounded-none animate-ping" />
          <span className="font-amiri text-lg font-bold text-emerald-300">سُبْحَانَ اللَّهِ</span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-200">تسبيح سريع:</span>
          <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-500/30">
            {spaceToast.count}
          </span>
        </div>
      )}

      {/* Floating Active Adhan Playing Banner with Stop Button */}
      {isAdhanPlaying && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border-2 border-emerald-500 px-6 py-3.5 shadow-2xl flex items-center gap-4 font-readex rounded-none backdrop-blur-md animate-fade-in">
          <span className="w-3 h-3 bg-emerald-400 rounded-none animate-ping shrink-0" />
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-300">
              يرفع الآن صوت الأذان المبارك {activeAdhanPrayer ? `(صلاة ${activeAdhanPrayer})` : ''}
            </p>
            <p className="text-[11px] text-slate-300">حيّ على الصلاة .. حيّ على الفلاح</p>
          </div>
          <button
            type="button"
            onClick={() => audioService.stop()}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-none cursor-pointer flex items-center gap-1.5 transition-colors border border-rose-500 shadow-xs mr-2"
          >
            <span>إيقاف الأذان</span>
            <span>✕</span>
          </button>
        </div>
      )}

      {/* Floating Random Dhikr Notification Popup Card */}
      {activeDhikrPop && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 font-readex animate-fade-in">
          <div className="bg-[#0b1f16]/95 border-2 border-emerald-400 text-white p-5 shadow-2xl backdrop-blur-md rounded-none relative">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
                <span className="text-xs font-bold text-emerald-300">تذكير بذكر الله 🌿</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDhikrPop(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                title="إغلاق التنبيه"
              >
                ✕
              </button>
            </div>

            <p className="font-amiri text-2xl font-bold text-center text-emerald-100 my-3 leading-relaxed">
              {activeDhikrPop.arabic}
            </p>

            <p className="text-xs text-center text-slate-200 leading-relaxed bg-emerald-950/70 p-2.5 border border-emerald-500/20">
              💡 {activeDhikrPop.virtue}
            </p>

            <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>اجعل لسانك رطباً بذكر الله</span>
              <button
                type="button"
                onClick={() => {
                  incrementDhikr('tasbih', 1);
                  audioService.playBeep(0.12);
                  setActiveDhikrPop(null);
                }}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer transition-colors border border-emerald-500/40 shadow-xs"
              >
                تسبيح (+1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
