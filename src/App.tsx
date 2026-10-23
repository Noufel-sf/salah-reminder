import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppSidebar, NavTab } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { PrayerDashboardView } from './components/views/PrayerDashboardView';
import { QiblaView } from './components/views/QiblaView';
import { TasbihView } from './components/views/TasbihView';
import { DuasView } from './components/views/DuasView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { QuranView } from './components/views/QuranView';
import { MiniWidgetView } from './components/MiniWidgetView';
import { SurahAlKahfModal } from './components/quran/SurahAlKahfModal';

import { AppSettings, PrayerName } from './types/prayer';
import { DEFAULT_SETTINGS, calculatePrayerTimes, DEFAULT_IQAMAH_MINUTES, getFastingDayInfo } from './utils/prayerTimes';
import { audioService } from './utils/audio';
import { incrementDhikr } from './utils/worshipStats';
import { sendDhikrNotification, DhikrReminder } from './utils/dhikrNotifications';

const STORAGE_KEY = 'noor_prayer_settings';

export const App: React.FC = () => {
  const isWidgetWindow = typeof window !== 'undefined' && window.location.hash === '#widget';
  if (isWidgetWindow) {
    return <MiniWidgetView />;
  }

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
  const lastPreAlertedPrayerRef = useRef<string>('');
  const lastIqamahAlertedRef = useRef<string>('');

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

  const handleToggleFastingToday = () => {
    const nextVal = !settings.isFastingToday;
    handleSaveSettings({ ...settings, isFastingToday: nextVal });
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
  const [activePreAdhanToast, setActivePreAdhanToast] = useState<{ prayerName: string; minutesBefore: number } | null>(null);
  const [activeIqamahToast, setActiveIqamahToast] = useState<{ prayerName: string } | null>(null);
  const [activeFastingToast, setActiveFastingToast] = useState<{ title: string; message: string; virtue?: string } | null>(null);
  const [isKahfModalOpen, setIsKahfModalOpen] = useState<boolean>(false);
  const [activeJumuahToast, setActiveJumuahToast] = useState<{ title: string; message: string; hadith?: string; isKahf?: boolean } | null>(null);
  const [showInPageWidget, setShowInPageWidget] = useState<boolean>(false);
  const toastTimeoutRef = useRef<any>(null);
  const dhikrPopTimeoutRef = useRef<any>(null);
  const preAdhanTimeoutRef = useRef<any>(null);
  const iqamahTimeoutRef = useRef<any>(null);
  const fastingToastTimeoutRef = useRef<any>(null);
  const jumuahToastTimeoutRef = useRef<any>(null);
  const lastFastingAlertRef = useRef<string>('');
  const lastJumuahKahfAlertRef = useRef<string>('');
  const lastJumuahIjabahAlertRef = useRef<string>('');

  const handleToggleMiniWidget = () => {
    if (window.electronAPI?.toggleWidget) {
      window.electronAPI.toggleWidget();
    } else {
      setShowInPageWidget((prev) => !prev);
    }
  };

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

  // Periodic & Random Dhikr Reminders Scheduler (Persistent & Resilient)
  useEffect(() => {
    if (settings.randomDhikrEnabled === false) return;

    const DHIKR_NEXT_KEY = 'noor_next_dhikr_target_time';

    const getIntervalMinutes = () => {
      if (settings.randomDhikrInterval && settings.randomDhikrInterval > 0) {
        return settings.randomDhikrInterval;
      }
      return 15 + Math.random() * 20; // 15 to 35 mins
    };

    const checkAndTrigger = () => {
      const now = Date.now();
      const rawTarget = localStorage.getItem(DHIKR_NEXT_KEY);
      const target = rawTarget ? parseInt(rawTarget, 10) : 0;

      // Initialize if no target exists
      if (!target || isNaN(target)) {
        const nextTarget = now + getIntervalMinutes() * 60 * 1000;
        localStorage.setItem(DHIKR_NEXT_KEY, nextTarget.toString());
        return;
      }

      // If scheduled time has arrived
      if (now >= target) {
        sendDhikrNotification();
        const nextTarget = now + getIntervalMinutes() * 60 * 1000;
        localStorage.setItem(DHIKR_NEXT_KEY, nextTarget.toString());
      }
    };

    // Run check on mount
    checkAndTrigger();

    // Regular ticker every 5 seconds so notifications are prompt and never throttled
    const intervalId = setInterval(checkAndTrigger, 5000);

    return () => {
      clearInterval(intervalId);
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

  // Test event listeners for Pre-Adhan and Iqamah testing from Settings
  useEffect(() => {
    const handleTestPreAdhan = (e: any) => {
      const prayerName = e.detail?.prayerName || 'الظهر';
      const mins = e.detail?.minutes || settings.remindMinutesBefore || 15;
      audioService.playChime(0.5);

      if (window.electronAPI) {
        window.electronAPI.showNotification(
          `اقترب موعد صلاة ${prayerName} ⏳`,
          `متبقي ${mins} دقيقة على الأذان في ${settings.city} - استعد للوضوء والصلاة.`
        );
      }
      setActivePreAdhanToast({ prayerName, minutesBefore: mins });
      if (preAdhanTimeoutRef.current) clearTimeout(preAdhanTimeoutRef.current);
      preAdhanTimeoutRef.current = setTimeout(() => setActivePreAdhanToast(null), 12000);
    };

    const handleTestIqamah = (e: any) => {
      const prayerName = e.detail?.prayerName || 'الظهر';
      audioService.playBeep(0.4);

      if (window.electronAPI) {
        window.electronAPI.showNotification(
          `حان موعد إقامة صلاة ${prayerName} 🕌`,
          `استووا واعتدلوا، أقم الصلاة يرحمك الله.`
        );
      }
      setActiveIqamahToast({ prayerName });
      if (iqamahTimeoutRef.current) clearTimeout(iqamahTimeoutRef.current);
      iqamahTimeoutRef.current = setTimeout(() => setActiveIqamahToast(null), 12000);
    };

    window.addEventListener('trigger-test-preadhan', handleTestPreAdhan);
    window.addEventListener('trigger-test-iqamah', handleTestIqamah);
    return () => {
      window.removeEventListener('trigger-test-preadhan', handleTestPreAdhan);
      window.removeEventListener('trigger-test-iqamah', handleTestIqamah);
    };
  }, [settings.remindMinutesBefore, settings.city]);

  // Test event listener for Sunnah Fasting from Settings
  useEffect(() => {
    const handleTestFasting = (e: any) => {
      const title = e.detail?.title || 'تذكير بصيام نافلة 🌙';
      const message = e.detail?.message || 'غداً يوم مبارك يُسن صيامه وعقد النية الليلة.';
      const virtue = e.detail?.virtue || '«مَنْ صَامَ يَوْماً فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفاً»';
      audioService.playChime(0.5);

      if (window.electronAPI) {
        window.electronAPI.showNotification(title, message);
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }

      setActiveFastingToast({ title, message, virtue });
      if (fastingToastTimeoutRef.current) clearTimeout(fastingToastTimeoutRef.current);
      fastingToastTimeoutRef.current = setTimeout(() => setActiveFastingToast(null), 14000);
    };

    window.addEventListener('trigger-test-fasting', handleTestFasting);
    return () => {
      window.removeEventListener('trigger-test-fasting', handleTestFasting);
      if (fastingToastTimeoutRef.current) clearTimeout(fastingToastTimeoutRef.current);
    };
  }, []);

  // Test event listeners for Friday Mode (Surah Al-Kahf & Hour of Response)
  useEffect(() => {
    const handleTestKahf = (e: any) => {
      const title = e.detail?.title || '🕌 نور ما بين الجمعتين - سورة الكهف';
      const message = e.detail?.message || 'جمعة مباركة! تذكير بقراءة سورة الكهف لنيل النور والبركة.';
      const hadith = e.detail?.hadith || '«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»';
      audioService.playChime(0.5);

      if (window.electronAPI) {
        window.electronAPI.showNotification(title, message);
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }

      setActiveJumuahToast({ title, message, hadith, isKahf: true });
      if (jumuahToastTimeoutRef.current) clearTimeout(jumuahToastTimeoutRef.current);
      jumuahToastTimeoutRef.current = setTimeout(() => setActiveJumuahToast(null), 16000);
    };

    const handleTestIjabah = (e: any) => {
      const title = e.detail?.title || '🤲 ساعة الاستجابة يوم الجمعة';
      const message = e.detail?.message || 'دخلت الآن آخر ساعة قبل غروب الشمس، تفرغ للدعاء وسؤال الله من فضله.';
      const hadith = e.detail?.hadith || '«فِيهَا سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ يَسْأَلُ اللَّهَ خَيْراً إِلَّا أَعْطَاهُ إِيَّاهُ»';
      audioService.playChime(0.5);

      if (window.electronAPI) {
        window.electronAPI.showNotification(title, message);
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }

      setActiveJumuahToast({ title, message, hadith, isKahf: false });
      if (jumuahToastTimeoutRef.current) clearTimeout(jumuahToastTimeoutRef.current);
      jumuahToastTimeoutRef.current = setTimeout(() => setActiveJumuahToast(null), 16000);
    };

    window.addEventListener('trigger-test-jumuah-kahf', handleTestKahf);
    window.addEventListener('trigger-test-jumuah-ijabah', handleTestIjabah);
    return () => {
      window.removeEventListener('trigger-test-jumuah-kahf', handleTestKahf);
      window.removeEventListener('trigger-test-jumuah-ijabah', handleTestIjabah);
      if (jumuahToastTimeoutRef.current) clearTimeout(jumuahToastTimeoutRef.current);
    };
  }, []);

  // Sunnah Fasting Evening Check (evening reminder between 18:00 and 22:30 for Monday/Thursday or White Days)
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    // Remind in the evening
    if (hours < 18 || hours > 22) return;

    const todayStr = now.toDateString();
    const fastingInfo = getFastingDayInfo(now);

    // Monday / Thursday check
    if (fastingInfo.isTomorrowMondayOrThursday && settings.fastingMondayThursdayReminder !== false) {
      const alertKey = `${todayStr}_fasting_mon_thu`;
      if (lastFastingAlertRef.current !== alertKey) {
        lastFastingAlertRef.current = alertKey;
        const title = fastingInfo.tomorrowTitle || 'تذكير بصيام الغد 🌙';
        const message = fastingInfo.tomorrowDescription || 'غداً يوم مبارك يُسن صيامه وعقد النية الليلة.';
        const virtue = fastingInfo.tomorrowVirtue || '«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»';

        audioService.playChime(0.5);
        if (window.electronAPI) {
          window.electronAPI.showNotification(title, message);
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: message });
        }

        setActiveFastingToast({ title, message, virtue });
        if (fastingToastTimeoutRef.current) clearTimeout(fastingToastTimeoutRef.current);
        fastingToastTimeoutRef.current = setTimeout(() => setActiveFastingToast(null), 15000);
      }
    }

    // White Days (13, 14, 15 Hijri) check
    if (fastingInfo.isTomorrowWhiteDay && settings.fastingWhiteDaysReminder !== false) {
      const alertKey = `${todayStr}_fasting_white_day`;
      if (lastFastingAlertRef.current !== alertKey) {
        lastFastingAlertRef.current = alertKey;
        const title = fastingInfo.tomorrowTitle || 'تذكير بصيام الأيام البيض 🌕';
        const message = fastingInfo.tomorrowDescription || 'غداً من الأيام البيض المباركة (13، 14، 15 هجري).';
        const virtue = fastingInfo.tomorrowVirtue || '«صِيَامُ ثَلاثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ صِيَامُ الدَّهْرِ كُلِّهِ»';

        audioService.playChime(0.5);
        if (window.electronAPI) {
          window.electronAPI.showNotification(title, message);
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: message });
        }

        setActiveFastingToast({ title, message, virtue });
        if (fastingToastTimeoutRef.current) clearTimeout(fastingToastTimeoutRef.current);
        fastingToastTimeoutRef.current = setTimeout(() => setActiveFastingToast(null), 15000);
      }
    }
  }, [currentTime, settings.fastingMondayThursdayReminder, settings.fastingWhiteDaysReminder]);

  // Blessed Friday Scheduler: Surah Al-Kahf in the morning, Hour of Response before Maghrib
  useEffect(() => {
    const now = new Date();
    // 5 = Friday
    if (now.getDay() !== 5) return;

    const todayStr = now.toDateString();
    const hours = now.getHours();

    // 1. Surah Al-Kahf Morning Reminder (between 07:00 and 12:00)
    if (hours >= 7 && hours < 12 && settings.jumuahKahfReminder !== false) {
      const kahfKey = `${todayStr}_jumuah_kahf`;
      if (lastJumuahKahfAlertRef.current !== kahfKey) {
        lastJumuahKahfAlertRef.current = kahfKey;
        const title = '🕌 نور ما بين الجمعتين - سورة الكهف';
        const message = 'جمعة مباركة! تذكير بقراءة سورة الكهف لنيل النور والمغفرة إلى الجمعة القادمة.';
        const hadith = '«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»';

        audioService.playChime(0.5);
        if (window.electronAPI) {
          window.electronAPI.showNotification(title, message);
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: message });
        }

        setActiveJumuahToast({ title, message, hadith, isKahf: true });
        if (jumuahToastTimeoutRef.current) clearTimeout(jumuahToastTimeoutRef.current);
        jumuahToastTimeoutRef.current = setTimeout(() => setActiveJumuahToast(null), 18000);
      }
    }

    // 2. Hour of Response (ساعة الاستجابة) Reminder (last 60 minutes before Maghrib)
    if (prayerData && prayerData.prayers && settings.jumuahIjabahReminder !== false) {
      const maghrib = prayerData.prayers.find((p) => p.id === 'Maghrib');
      if (maghrib) {
        const maghribMs = new Date(maghrib.time).getTime();
        const nowMs = now.getTime();
        const diffToMaghrib = maghribMs - nowMs;
        // If within 60 minutes before Maghrib (0 to 60 minutes before)
        if (diffToMaghrib > 0 && diffToMaghrib <= 60 * 60 * 1000) {
          const ijabahKey = `${todayStr}_jumuah_ijabah`;
          if (lastJumuahIjabahAlertRef.current !== ijabahKey) {
            lastJumuahIjabahAlertRef.current = ijabahKey;
            const title = '🤲 دخلت الآن ساعة الاستجابة يوم الجمعة';
            const message = 'متبقي ساعة على غروب الشمس؛ تفرغ للدعاء والذكر والابتهال إلى الله تعالى.';
            const hadith = '«فِيهَا سَاعَةٌ لَا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ يَسْأَلُ اللَّهَ خَيْراً إِلَّا أَعْطَاهُ إِيَّاهُ»';

            audioService.playChime(0.5);
            if (window.electronAPI) {
              window.electronAPI.showNotification(title, message);
            } else if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(title, { body: message });
            }

            setActiveJumuahToast({ title, message, hadith, isKahf: false });
            if (jumuahToastTimeoutRef.current) clearTimeout(jumuahToastTimeoutRef.current);
            jumuahToastTimeoutRef.current = setTimeout(() => setActiveJumuahToast(null), 20000);
          }
        }
      }
    }
  }, [currentTime, prayerData, settings.jumuahKahfReminder, settings.jumuahIjabahReminder]);

  // Real-time System Tray synchronization with next prayer & tooltip
  useEffect(() => {
    if (!prayerData || !window.electronAPI?.updateTray) return;

    const next = prayerData.nextPrayer;
    if (!next) return;

    const now = currentTime.getTime();
    const target = new Date(next.time).getTime();
    const diff = Math.max(0, target - now);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const remainingText = hours > 0 ? `${hours} س و ${minutes} د` : `${minutes} دقيقة`;
    const tooltip = `رمضان برو | ${next.name} بعد ${remainingText} (${next.timeString})`;

    window.electronAPI.updateTray({
      tooltip,
      nextPrayerName: next.name,
      nextPrayerTime: next.timeString,
      remainingText,
      isMuted: settings.soundOption === 'silent'
    });
  }, [currentTime, prayerData, settings.soundOption]);

  // Tray menu listeners for Quick Tasbih & Toggle Mute
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribeTasbih = window.electronAPI.onQuickTasbih?.(() => {
      const record = incrementDhikr('tasbih', 1);
      audioService.playBeep(0.12);
      setSpaceToast({ count: record.tasbih });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setSpaceToast(null), 1200);
      window.dispatchEvent(new CustomEvent('space-tasbih-tap'));
    });

    const unsubscribeMute = window.electronAPI.onToggleMute?.(() => {
      handleToggleMute();
    });

    return () => {
      unsubscribeTasbih?.();
      unsubscribeMute?.();
    };
  }, [settings.soundOption]);

  useEffect(() => {
    if (!prayerData || !prayerData.prayers) return;

    const now = new Date();
    const todayStr = now.toDateString();
    const nowMs = now.getTime();

    prayerData.prayers.forEach((prayer) => {
      if (prayer.id === 'Sunrise') return;
      if (!settings.enabledPrayers[prayer.id]) return;

      const prayerTime = new Date(prayer.time);
      const prayerMs = prayerTime.getTime();
      const diffMs = nowMs - prayerMs;

      // 1. Pre-Adhan Preparation Alert (e.g. 10 or 15 minutes before)
      const remindMins = settings.remindMinutesBefore || 0;
      if (remindMins > 0) {
        const preTimeMs = prayerMs - remindMins * 60 * 1000;
        const preDiffMs = nowMs - preTimeMs;
        if (preDiffMs >= 0 && preDiffMs < 45000) {
          const preKey = `${todayStr}_preadhan_${prayer.id}_${remindMins}`;
          if (lastPreAlertedPrayerRef.current !== preKey) {
            lastPreAlertedPrayerRef.current = preKey;
            audioService.playChime(0.5);

            if (window.electronAPI) {
              window.electronAPI.showNotification(
                `اقترب موعد صلاة ${prayer.name} ⏳`,
                `متبقي ${remindMins} دقيقة على الأذان في ${settings.city} - استعد للوضوء والصلاة.`
              );
            } else if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`اقترب موعد صلاة ${prayer.name} ⏳`, {
                body: `متبقي ${remindMins} دقيقة على الأذان في ${settings.city} - استعد للوضوء.`
              });
            }

            setActivePreAdhanToast({ prayerName: prayer.name, minutesBefore: remindMins });
            if (preAdhanTimeoutRef.current) clearTimeout(preAdhanTimeoutRef.current);
            preAdhanTimeoutRef.current = setTimeout(() => setActivePreAdhanToast(null), 14000);
          }
        }
      }

      // 2. Exact Adhan Time Alert
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

      // 3. Iqamah Time Alert
      if (settings.iqamahEnabled !== false) {
        const iqamahMins = settings.iqamahDurations?.[prayer.id] ?? DEFAULT_IQAMAH_MINUTES[prayer.id] ?? 15;
        if (iqamahMins > 0) {
          const iqamahTimeMs = prayerMs + iqamahMins * 60 * 1000;
          const iqamahDiffMs = nowMs - iqamahTimeMs;
          if (iqamahDiffMs >= 0 && iqamahDiffMs < 45000) {
            const iqamahKey = `${todayStr}_iqamah_${prayer.id}_${iqamahMins}`;
            if (lastIqamahAlertedRef.current !== iqamahKey) {
              lastIqamahAlertedRef.current = iqamahKey;
              audioService.playBeep(0.4);

              if (window.electronAPI) {
                window.electronAPI.showNotification(
                  `حان موعد إقامة صلاة ${prayer.name} 🕌`,
                  `استووا واعتدلوا، أقم الصلاة يرحمك الله.`
                );
              } else if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`حان موعد إقامة صلاة ${prayer.name} 🕌`, {
                  body: `استووا واعتدلوا، أقم الصلاة يرحمك الله.`
                });
              }

              setActiveIqamahToast({ prayerName: prayer.name });
              if (iqamahTimeoutRef.current) clearTimeout(iqamahTimeoutRef.current);
              iqamahTimeoutRef.current = setTimeout(() => setActiveIqamahToast(null), 14000);
            }
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
      case 'quran':
        return {
          title: 'المصحف الشريف والورد اليومي',
          subtitle: 'آية اليوم وتفسيرها الميسر ومتابعة الورد والختمة'
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
          onToggleWidget={handleToggleMiniWidget}
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
              onOpenQuranTab={() => setCurrentTab('quran')}
              onOpenKahfReader={() => setIsKahfModalOpen(true)}
            />
          )}

          {currentTab === 'quran' && (
            <QuranView />
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

      {/* Floating Pre-Adhan Preparation Toast */}
      {activePreAdhanToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 font-readex animate-fade-in">
          <div className="bg-[#101c24]/95 border-2 border-amber-400 text-white p-4 shadow-2xl backdrop-blur-md rounded-none relative">
            <div className="flex items-center justify-between pb-2 border-b border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-none animate-ping" />
                <span className="text-xs font-bold text-amber-300">
                  اقترب موعد صلاة {activePreAdhanToast.prayerName} ⏳
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePreAdhanToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-100 my-2 leading-relaxed text-right">
              متبقي {activePreAdhanToast.minutesBefore} دقيقة على رفع الأذان — استعد للوضوء والصلاة وأذكار المسجد.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
              <span className="text-amber-200">«إِسْبَاغُ الْوُضُوءِ عَلَى الْمَكَارِهِ»</span>
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('duas');
                  setActivePreAdhanToast(null);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer transition-colors"
              >
                أذكار الوضوء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Iqamah Time Arrived Toast */}
      {activeIqamahToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 font-readex animate-fade-in">
          <div className="bg-[#0b1f16]/95 border-2 border-emerald-400 text-white p-4 shadow-2xl backdrop-blur-md rounded-none relative">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-400/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
                <span className="text-xs font-bold text-emerald-300">
                  حان الآن موعد إقامة صلاة {activeIqamahToast.prayerName} 🕌
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveIqamahToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
            <p className="font-amiri text-lg font-bold text-emerald-100 text-center my-2 leading-relaxed">
              «اسْتَوُوا وَاعْتَدِلُوا وَتَرَاصُّوا، أَقِمِ الصَّلَاةَ يَرْحَمُكَ اللَّهُ»
            </p>
            <div className="flex items-center justify-end pt-2 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => setActiveIqamahToast(null)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                أقم الصلاة (إغلاق)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sunnah Fasting Reminder Toast */}
      {activeFastingToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 font-readex animate-fade-in">
          <div className="bg-[#0b1f16]/95 border-2 border-emerald-400 text-white p-5 shadow-2xl backdrop-blur-md rounded-none relative">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
                <span className="text-xs font-bold text-emerald-300">{activeFastingToast.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveFastingToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                title="إغلاق التنبيه"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-100 my-2.5 leading-relaxed text-right">
              {activeFastingToast.message}
            </p>

            {activeFastingToast.virtue && (
              <p className="font-amiri text-base font-bold text-center text-amber-200 bg-emerald-950/70 p-2.5 border border-emerald-500/20 leading-relaxed">
                {activeFastingToast.virtue}
              </p>
            )}

            <div className="mt-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">قال ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ»</span>
              <button
                type="button"
                onClick={() => {
                  handleToggleFastingToday();
                  setActiveFastingToast(null);
                }}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer transition-colors border border-emerald-500/40 shadow-xs"
              >
                عقدت النية (أنا صائم) 🌙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Friday Blessed Jumu'ah Notification Toast */}
      {activeJumuahToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 font-readex animate-fade-in">
          <div className="bg-[#0b1f16]/95 border-2 border-emerald-400 text-white p-5 shadow-2xl backdrop-blur-md rounded-none relative">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-ping" />
                <span className="text-xs font-bold text-emerald-300">{activeJumuahToast.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveJumuahToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
                title="إغلاق التنبيه"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-100 my-2.5 leading-relaxed text-right">
              {activeJumuahToast.message}
            </p>

            {activeJumuahToast.hadith && (
              <p className="font-amiri text-base font-bold text-center text-amber-200 bg-emerald-950/70 p-2.5 border border-emerald-500/20 leading-relaxed">
                {activeJumuahToast.hadith}
              </p>
            )}

            <div className="mt-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">جمعة مباركة طيبة 🌿</span>
              {activeJumuahToast.isKahf ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveJumuahToast(null);
                    setIsKahfModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer transition-colors border border-emerald-500/40 shadow-xs flex items-center gap-1.5"
                >
                  <span>قراءة سورة الكهف الآن</span>
                  <span>📖</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('duas');
                    setActiveJumuahToast(null);
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  أدعية الجمعة 🤲
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Surah Al-Kahf In-App Full Reader Modal */}
      <SurahAlKahfModal
        isOpen={isKahfModalOpen}
        onClose={() => setIsKahfModalOpen(false)}
      />

      {/* Floating In-page Desktop Mini-Widget (Fallback or browser preview mode) */}
      {showInPageWidget && (
        <div className="fixed bottom-6 left-6 z-50 w-[330px] h-[76px] shadow-2xl animate-fade-in">
          <MiniWidgetView />
        </div>
      )}
    </div>
  );
};

export default App;
