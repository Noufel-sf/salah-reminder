import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Bell, 
  BellOff, 
  Sunrise, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  Sparkles, 
  Check, 
  Compass, 
  Quote, 
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { PrayerItem, PrayerName, AppSettings } from '../../types/prayer';
import { calculateQibla } from '../../utils/prayerTimes';

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
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number; progress: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0
  });

  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [tasbihPhraseIndex, setTasbihPhraseIndex] = useState<number>(0);

  const tasbihPhrases = [
    { arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', meaning: 'Glory be to Allah' },
    { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', meaning: 'Praise be to Allah' },
    { arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', english: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah' }
  ];

  useEffect(() => {
    if (!nextPrayer) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(nextPrayer.time).getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const prevTime = currentPrayer ? new Date(currentPrayer.time).getTime() : target - 3.5 * 3600 * 1000;
      const totalSpan = Math.max(1000, target - prevTime);
      const elapsed = Math.max(0, now - prevTime);
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));

      setCountdown({ hours, minutes, seconds, progress: progressPercent });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, currentPrayer]);

  const qiblaAngle = calculateQibla(settings.latitude, settings.longitude);

  const getPrayerIcon = (id: PrayerName) => {
    switch (id) {
      case 'Fajr':
        return <Moon size={16} className="text-[#6366f1]" />;
      case 'Sunrise':
        return <Sunrise size={16} className="text-[#d97706]" />;
      case 'Dhuhr':
        return <Sun size={16} className="text-[#24634c]" />;
      case 'Asr':
        return <SunMedium size={16} className="text-[#ca8a04]" />;
      case 'Maghrib':
        return <Sunset size={16} className="text-[#ea580c]" />;
      case 'Isha':
        return <Moon size={16} className="text-[#2563eb]" />;
      default:
        return <Sparkles size={16} className="text-[#24634c]" />;
    }
  };

  const getPrayerBg = (id: PrayerName) => {
    switch (id) {
      case 'Fajr':
        return 'bg-indigo-50 border-indigo-100';
      case 'Sunrise':
        return 'bg-amber-50 border-amber-100';
      case 'Dhuhr':
        return 'bg-emerald-50 border-emerald-100';
      case 'Asr':
        return 'bg-yellow-50 border-yellow-100';
      case 'Maghrib':
        return 'bg-orange-50 border-orange-100';
      case 'Isha':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-emerald-50 border-emerald-100';
    }
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Hero Next Prayer Banner (Fixed Spacing, No Overlap, Elegant Proportions) */}
      <div className="hero-banner p-6 text-white shadow-md">
        <div className="relative z-10 max-w-xl">
          {/* Top Info Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/15 px-2.5 py-0.5 rounded-full text-[#d2ecde] border border-white/10">
                Next Prayer
              </span>
              <button
                onClick={onOpenSettingsTab}
                className="flex items-center gap-1 text-xs text-[#d2ecde] hover:text-white transition-colors bg-black/15 px-2.5 py-0.5 rounded-full"
              >
                <MapPin size={11} className="text-[#48a07f]" />
                <span>{settings.city}, {settings.country}</span>
              </button>
            </div>

            {/* Live Countdown Pill */}
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-white border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[#48a07f] animate-pulse"></span>
              <span>In {padZero(countdown.hours)}h {padZero(countdown.minutes)}m {padZero(countdown.seconds)}s</span>
            </div>
          </div>

          {/* Prayer Name & Scheduled Time */}
          <div className="flex items-baseline gap-4 my-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              {nextPrayer?.name || 'Prayer'}
            </h2>
            <span className="arabic-calligraphy text-3xl font-bold text-[#d2ecde]">
              {nextPrayer?.arabicName}
            </span>
            <div className="ml-auto text-xl font-bold font-mono text-white/90 flex items-center gap-1.5">
              <Clock size={18} className="text-[#48a07f]" />
              <span>{nextPrayer?.timeString}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="h-1.5 w-full bg-black/25 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#48a07f] to-[#a3e4c0] rounded-full transition-all duration-1000"
                style={{ width: `${countdown.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#b7ddc8] mt-1.5">
              <span>{currentPrayer?.name || 'Previous'}</span>
              <span>{Math.round(countdown.progress)}% elapsed</span>
              <span>{nextPrayer?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Spacious, No Clipping) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: 6 Waqt Prayer Timetable & Motivation Card */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          <div className="ramadhan-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#edf3ee] mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#123d2e]">Today's Prayer Schedule</h3>
                <p className="text-[11px] text-[#71887e]">Based on {settings.calculationMethod}</p>
              </div>
              <button
                onClick={onOpenSettingsTab}
                className="text-xs font-semibold text-[#24634c] hover:text-[#123d2e] bg-[#f1f6f2] px-2.5 py-1 rounded-lg border border-[#dbe6df] transition-colors"
              >
                Change Method
              </button>
            </div>

            {/* List of 6 prayers */}
            <div className="space-y-2">
              {prayers.map((prayer) => {
                const isNext = prayer.isNext;
                const isPassed = prayer.isPassed;

                return (
                  <div
                    key={prayer.id}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                      isNext
                        ? 'bg-[#e8f5ee] border-[#48a07f] shadow-xs'
                        : isPassed
                        ? 'bg-[#fafcfa] border-[#edf3ee] opacity-75'
                        : 'bg-white border-[#e5ede7] hover:border-[#b8d6c3]'
                    }`}
                  >
                    {/* Left: Icon, Name, Arabic */}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${getPrayerBg(prayer.id)}`}>
                        {getPrayerIcon(prayer.id)}
                      </div>

                      <div className="leading-tight">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isNext ? 'text-[#123d2e]' : isPassed ? 'text-[#71887e]' : 'text-[#184e3b]'}`}>
                            {prayer.name}
                          </span>
                          <span className="arabic-calligraphy text-[11px] font-bold text-[#71887e]">
                            {prayer.arabicName}
                          </span>
                          {isNext && (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#24634c] text-white">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#71887e] mt-0.5">
                          {isPassed ? (
                            <span className="flex items-center gap-1 text-[#48a07f]">
                              <Check size={10} />
                              Passed
                            </span>
                          ) : isNext ? (
                            <span className="text-[#24634c] font-semibold">Current upcoming</span>
                          ) : (
                            <span>Upcoming</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Time & Notification Bell */}
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-bold ${
                        isNext ? 'text-[#123d2e] font-extrabold text-sm' : isPassed ? 'text-[#71887e]' : 'text-[#184e3b]'
                      }`}>
                        {prayer.timeString}
                      </span>

                      {prayer.id !== 'Sunrise' && (
                        <button
                          onClick={() => onToggleNotification(prayer.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            prayer.notificationEnabled
                              ? 'bg-[#e8f5ee] border-[#b8d6c3] text-[#24634c]'
                              : 'bg-white border-[#edf3ee] text-[#98aba2] hover:text-[#556e62]'
                          }`}
                          title={prayer.notificationEnabled ? 'Mute alert' : 'Enable alert'}
                        >
                          {prayer.notificationEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advice card */}
          <div className="bg-[#e8f5ee] border border-[#d2ecde] p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#24634c] flex items-center justify-center text-white shrink-0">
              <Sparkles size={18} className="text-[#a3e4c0]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#123d2e]">Never miss a prayer</h4>
              <p className="text-[11px] text-[#347d62] mt-0.5">
                "Keep your connection with Allah strong. Prayer is the comfort of the soul and peace of mind."
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Verse, Quick Tasbih & Qibla Direction (Fixed Width, Clean Cards) */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-5">
          {/* 1. Today's Verse Card */}
          <div className="ramadhan-card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#edf3ee]">
              <span className="text-[11px] font-bold text-[#123d2e] uppercase tracking-wider flex items-center gap-1.5">
                <Quote size={13} className="text-[#24634c]" />
                Today's Verse
              </span>
              <span className="text-[10px] font-semibold text-[#24634c] bg-[#e8f5ee] px-2 py-0.5 rounded-md border border-[#d2ecde]">
                Surah Al-Inshirah 94:6
              </span>
            </div>

            <div className="text-center py-2 px-1">
              <p className="arabic-calligraphy text-2xl font-bold text-[#123d2e] leading-relaxed my-2">
                إِنَّ مَعَ الْعُسْرِ يُسْرًا
              </p>
              <p className="text-xs font-semibold text-[#24634c] italic">
                "Indeed, with hardship comes ease."
              </p>
              <p className="text-[11px] text-[#71887e] mt-1.5">
                A reminder of hope and divine relief through every difficulty.
              </p>
            </div>
          </div>

          {/* 2. Quick Digital Tasbih Card */}
          <div className="ramadhan-card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#edf3ee]">
              <span className="text-[11px] font-bold text-[#123d2e] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#24634c]" />
                Quick Tasbih
              </span>
              <button
                onClick={() => setTasbihCount(0)}
                className="p-1 rounded-md text-[#71887e] hover:text-[#123d2e] hover:bg-[#f1f6f2]"
                title="Reset Count"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setTasbihPhraseIndex((tasbihPhraseIndex + 1) % tasbihPhrases.length)}
                className="text-[11px] font-semibold text-[#24634c] hover:underline"
              >
                {tasbihPhrases[tasbihPhraseIndex].english} • {tasbihPhrases[tasbihPhraseIndex].meaning}
              </button>
              <p className="arabic-calligraphy text-xl font-bold text-[#123d2e] my-1">
                {tasbihPhrases[tasbihPhraseIndex].arabic}
              </p>

              {/* Tap Button */}
              <button
                onClick={() => setTasbihCount(tasbihCount + 1)}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#133e2c] to-[#24634c] text-white flex flex-col items-center justify-center shadow-md shadow-[#133e2c]/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer my-2.5"
              >
                <span className="text-2xl font-black font-mono">{tasbihCount}</span>
                <span className="text-[9px] text-[#a3e4c0] uppercase font-bold tracking-wider">Tap</span>
              </button>
              <span className="text-[10px] text-[#71887e]">Dhikr Target: 33 / 100</span>
            </div>
          </div>

          {/* 3. Qibla Direction Preview Card */}
          <div 
            onClick={onOpenQiblaTab}
            className="ramadhan-card p-4 cursor-pointer hover:border-[#48a07f] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] text-[#24634c] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#123d2e]">Qibla Direction</h4>
                  <p className="text-[11px] text-[#71887e]">{qiblaAngle}° Clockwise from North</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#24634c] flex items-center gap-0.5">
                View <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
