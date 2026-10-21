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
  RotateCcw
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
  // Live countdown state
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number; progress: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0
  });

  // Quick Tasbih counter inside dashboard
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
        return <Moon size={18} className="text-[#6366f1]" />;
      case 'Sunrise':
        return <Sunrise size={18} className="text-[#f59e0b]" />;
      case 'Dhuhr':
        return <Sun size={18} className="text-[#2d6a4f]" />;
      case 'Asr':
        return <SunMedium size={18} className="text-[#eab308]" />;
      case 'Maghrib':
        return <Sunset size={18} className="text-[#ea580c]" />;
      case 'Isha':
        return <Moon size={18} className="text-[#3b82f6]" />;
      default:
        return <Sparkles size={18} className="text-[#2d6a4f]" />;
    }
  };

  const getPrayerBgTint = (id: PrayerName) => {
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Hero Next Prayer Panoramic Card (Forest Green with Mosque Silhouette) */}
      <div className="mosque-banner rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#a3e4c0] bg-white/10 px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
              Upcoming Prayer
            </span>
            <button
              onClick={onOpenSettingsTab}
              className="flex items-center gap-1.5 text-xs text-[#d8f3dc] hover:text-white transition-colors bg-black/10 px-3 py-1 rounded-full"
            >
              <MapPin size={12} className="text-[#52b788]" />
              <span>{settings.city}, {settings.country}</span>
            </button>
          </div>

          <div className="flex items-baseline gap-4 mt-2">
            <h2 className="text-5xl font-black tracking-tight text-white">
              {nextPrayer?.name || 'Prayer'}
            </h2>
            <span className="arabic-calligraphy text-4xl text-[#d8f3dc] font-bold drop-shadow">
              {nextPrayer?.arabicName}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-2xl font-bold font-mono text-white/95">
              <Clock size={20} className="text-[#52b788]" />
              <span>{nextPrayer?.timeString}</span>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25">
              <span className="text-xs text-[#d8f3dc] font-medium">In</span>
              <span className="font-mono text-sm font-bold text-white tracking-wider">
                {padZero(countdown.hours)}h {padZero(countdown.minutes)}m {padZero(countdown.seconds)}s
              </span>
            </div>
          </div>

          {/* Progress to next prayer */}
          <div className="mt-6 max-w-md">
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#52b788] to-[#95d5b2] rounded-full transition-all duration-1000"
                style={{ width: `${countdown.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[#b7e4c7] mt-1.5">
              <span>{currentPrayer?.name || 'Previous'}</span>
              <span>{Math.round(countdown.progress)}% elapsed</span>
              <span>{nextPrayer?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Desktop Multi-Column Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column: 6 Waqt Prayer Timetable & Advice (Col span 7) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="sage-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#114232]">Today's Prayer Times</h3>
                <p className="text-xs text-[#74897f]">Accurate local calculations based on {settings.calculationMethod}</p>
              </div>
              <button
                onClick={onOpenSettingsTab}
                className="text-xs font-semibold text-[#2d6a4f] hover:text-[#114232] bg-[#f0f7f2] px-3 py-1.5 rounded-xl border border-[#d8e6dc] transition-colors"
              >
                Change Method
              </button>
            </div>

            {/* Table Rows */}
            <div className="space-y-2.5">
              {prayers.map((prayer) => {
                const isNext = prayer.isNext;
                const isPassed = prayer.isPassed;

                return (
                  <div
                    key={prayer.id}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                      isNext
                        ? 'next-prayer-row'
                        : isPassed
                        ? 'bg-[#fafbfa] border-[#edf3ee] opacity-80'
                        : 'bg-white border-[#e6efe8] hover:border-[#b7ddc4]'
                    }`}
                  >
                    {/* Left: Icon, Name, Arabic Name */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${getPrayerBgTint(prayer.id)}`}>
                        {getPrayerIcon(prayer.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isNext ? 'text-[#114232]' : isPassed ? 'text-[#74897f]' : 'text-[#1f5945]'}`}>
                            {prayer.name}
                          </span>
                          <span className="arabic-calligraphy text-xs font-bold text-[#74897f]">
                            {prayer.arabicName}
                          </span>
                          {isNext && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2d6a4f] text-white">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#74897f] flex items-center gap-1.5 mt-0.5">
                          {isPassed ? (
                            <span className="flex items-center gap-1 text-[#52b788]">
                              <Check size={12} />
                              Passed
                            </span>
                          ) : isNext ? (
                            <span className="text-[#2d6a4f] font-semibold">Active next</span>
                          ) : (
                            <span>Upcoming</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Time & Notification Bell */}
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-base font-bold ${
                        isNext ? 'text-[#114232] text-lg font-black' : isPassed ? 'text-[#74897f]' : 'text-[#1f5945]'
                      }`}>
                        {prayer.timeString}
                      </span>

                      {prayer.id !== 'Sunrise' && (
                        <button
                          onClick={() => onToggleNotification(prayer.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            prayer.notificationEnabled
                              ? 'bg-[#eaf4ee] border-[#b7ddc4] text-[#2d6a4f]'
                              : 'bg-white border-[#edf3ee] text-[#a9bea1] hover:text-[#74897f]'
                          }`}
                          title={prayer.notificationEnabled ? 'Mute notification' : 'Enable notification'}
                        >
                          {prayer.notificationEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* "Never miss a prayer" Banner matching image design */}
          <div className="bg-[#eaf4ee] border border-[#b7ddc4] p-5 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#2d6a4f]/20">
              <Sparkles size={22} className="text-[#a3e4c0]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#114232]">Never miss a prayer</h4>
              <p className="text-xs text-[#40916c] mt-0.5">
                "Keep your connection with Allah strong. Prayer is the comfort of the soul and light for the heart."
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Verse, Quick Tasbih & Qibla Widget (Col span 5) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Today's Verse (Identical styling to reference image) */}
          <div className="sage-card p-6 bg-gradient-to-b from-white to-[#f9fcf9] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#114232] uppercase tracking-wider flex items-center gap-1.5">
                <Quote size={14} className="text-[#52b788]" />
                Today's Verse
              </span>
              <span className="text-[11px] font-semibold text-[#52b788] bg-[#eaf4ee] px-2 py-0.5 rounded-full border border-[#d8e6dc]">
                Surah Al-Inshirah 94:6
              </span>
            </div>

            <div className="text-center py-4 px-2">
              <p className="arabic-calligraphy text-3xl font-bold text-[#114232] leading-relaxed drop-shadow-sm mb-3">
                إِنَّ مَعَ الْعُسْرِ يُسْرًا
              </p>
              <p className="text-sm font-semibold text-[#2d6a4f] italic">
                "Indeed, with hardship comes ease."
              </p>
              <p className="text-xs text-[#74897f] mt-1">
                Reflect upon Allah's promise of relief and peace in every struggle.
              </p>
            </div>
          </div>

          {/* Quick Digital Tasbih Card */}
          <div className="sage-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#114232] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#52b788]" />
                Quick Tasbih
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTasbihCount(0)}
                  className="p-1 rounded-lg text-[#74897f] hover:text-[#114232] hover:bg-[#f0f7f2]"
                  title="Reset"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setTasbihPhraseIndex((tasbihPhraseIndex + 1) % tasbihPhrases.length)}
                className="text-xs font-semibold text-[#52b788] hover:text-[#2d6a4f] transition-colors"
              >
                {tasbihPhrases[tasbihPhraseIndex].english} • {tasbihPhrases[tasbihPhraseIndex].meaning}
              </button>
              <p className="arabic-calligraphy text-2xl font-bold text-[#114232] my-2">
                {tasbihPhrases[tasbihPhraseIndex].arabic}
              </p>

              {/* Tap Counter Bead Dial */}
              <button
                onClick={() => setTasbihCount(tasbihCount + 1)}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-b from-[#164e3c] to-[#2d6a4f] text-white flex flex-col items-center justify-center shadow-lg shadow-[#164e3c]/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer my-3"
              >
                <span className="text-3xl font-black font-mono">{tasbihCount}</span>
                <span className="text-[10px] text-[#a3e4c0] uppercase tracking-wider">Tap</span>
              </button>
              <span className="text-[11px] text-[#74897f]">Daily Dhikr goal: 33 / 100</span>
            </div>
          </div>

          {/* Qibla Direction Mini Preview */}
          <div 
            onClick={onOpenQiblaTab}
            className="sage-card p-5 cursor-pointer hover:border-[#52b788] group transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eaf4ee] text-[#2d6a4f] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#114232]">Qibla Direction</h4>
                  <p className="text-xs text-[#74897f]">{qiblaAngle}° Clockwise from North</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#2d6a4f] bg-[#f0f7f2] px-3 py-1 rounded-xl border border-[#d8e6dc]">
                View Compass →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
