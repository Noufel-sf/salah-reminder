import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Bell, Sparkles, Sun, Moon, Sunset, Sunrise, Eye } from 'lucide-react';
import { PrayerItem } from '../../types/prayer';

interface NextPrayerHeroProps {
  nextPrayer: PrayerItem | null;
  currentPrayer: PrayerItem | null;
}

type AtmosphericPeriod = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'night';

interface AtmosphericConfig {
  id: AtmosphericPeriod;
  name: string;
  periodLabel: string;
  subtitle: string;
  bgGradient: string;
  glowPrimary: string;
  glowSecondary: string;
  accentText: string;
  pulseDot: string;
  progressGradient: string;
  badgeBg: string;
  icon: React.ReactNode;
}

const ATMOSPHERIC_THEMES: Record<AtmosphericPeriod, AtmosphericConfig> = {
  fajr: {
    id: 'fajr',
    name: 'شفق الفجر',
    periodLabel: 'الشفق الصباحي والفجر',
    subtitle: 'سكينة السَّحَر ونور الصباح المبكر',
    bgGradient: 'from-[#101726] via-[#1a283e] to-[#253248]',
    glowPrimary: 'bg-rose-400/20',
    glowSecondary: 'bg-sky-400/20',
    accentText: 'text-sky-200',
    pulseDot: 'bg-sky-400',
    progressGradient: 'from-sky-300 via-rose-300 to-indigo-400',
    badgeBg: 'bg-sky-950/40 border-sky-400/25 text-sky-200',
    icon: <Sunrise size={13} className="text-sky-300" />
  },
  sunrise: {
    id: 'sunrise',
    name: 'النقاء الذهبي للشروق',
    periodLabel: 'إشراقة الصباح والضحى',
    subtitle: 'النقاء الذهبي والضياء وبركة البكور',
    bgGradient: 'from-[#291e0a] via-[#4d370f] to-[#6d4d14]',
    glowPrimary: 'bg-amber-400/25',
    glowSecondary: 'bg-yellow-300/20',
    accentText: 'text-amber-200',
    pulseDot: 'bg-amber-400',
    progressGradient: 'from-amber-300 via-yellow-200 to-amber-500',
    badgeBg: 'bg-amber-950/40 border-amber-400/25 text-amber-200',
    icon: <Sun size={13} className="text-amber-300" />
  },
  dhuhr: {
    id: 'dhuhr',
    name: 'الظهيرة الزمردية',
    periodLabel: 'الظهيرة والزمرد النقي',
    subtitle: 'انتصاف النهار وبركة السعي وصلاة الظهر',
    bgGradient: 'from-[#0b291c] via-[#124d34] to-[#186a48]',
    glowPrimary: 'bg-emerald-400/25',
    glowSecondary: 'bg-teal-300/20',
    accentText: 'text-emerald-200',
    pulseDot: 'bg-emerald-400',
    progressGradient: 'from-emerald-300 via-teal-200 to-emerald-500',
    badgeBg: 'bg-emerald-950/40 border-emerald-400/25 text-emerald-200',
    icon: <Sparkles size={13} className="text-emerald-300" />
  },
  asr: {
    id: 'asr',
    name: 'الأصيل الدافئ',
    periodLabel: 'وقت العشي والأصيل',
    subtitle: 'الصلاة الوسطى وظلال العشي الهادئة',
    bgGradient: 'from-[#2b180a] via-[#4d2c14] to-[#6c3d1a]',
    glowPrimary: 'bg-amber-500/25',
    glowSecondary: 'bg-orange-400/20',
    accentText: 'text-amber-200',
    pulseDot: 'bg-amber-400',
    progressGradient: 'from-amber-300 via-orange-300 to-amber-500',
    badgeBg: 'bg-amber-950/40 border-amber-400/25 text-amber-200',
    icon: <Sun size={13} className="text-orange-300" />
  },
  maghrib: {
    id: 'maghrib',
    name: 'شفق المغرب البرتقالي',
    periodLabel: 'شفق الغروب والإفطار',
    subtitle: 'إقبال الليل وإدبار النهار والسكينة العميقة',
    bgGradient: 'from-[#2d0e19] via-[#521727] to-[#781f33]',
    glowPrimary: 'bg-orange-500/30',
    glowSecondary: 'bg-rose-500/25',
    accentText: 'text-orange-200',
    pulseDot: 'bg-orange-400',
    progressGradient: 'from-orange-400 via-rose-300 to-amber-300',
    badgeBg: 'bg-rose-950/40 border-rose-400/25 text-rose-200',
    icon: <Sunset size={13} className="text-orange-300" />
  },
  night: {
    id: 'night',
    name: 'النيلي الليلي',
    periodLabel: 'سكون الليل والتهجد',
    subtitle: 'سواد الليل النيلي ومناجاة القائمين',
    bgGradient: 'from-[#080d1a] via-[#0f1a35] to-[#16264c]',
    glowPrimary: 'bg-indigo-500/25',
    glowSecondary: 'bg-blue-400/20',
    accentText: 'text-indigo-200',
    pulseDot: 'bg-indigo-400',
    progressGradient: 'from-indigo-300 via-sky-300 to-indigo-500',
    badgeBg: 'bg-indigo-950/40 border-indigo-400/25 text-indigo-200',
    icon: <Moon size={13} className="text-indigo-300" />
  }
};

export const NextPrayerHero: React.FC<NextPrayerHeroProps> = ({
  nextPrayer,
  currentPrayer
}) => {
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    progress: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0
  });

  const [previewTheme, setPreviewTheme] = useState<AtmosphericPeriod | null>(null);
  const [showPreviewMenu, setShowPreviewMenu] = useState<boolean>(false);

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

      setCountdown({
        hours,
        minutes,
        seconds,
        progress: progressPercent
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, currentPrayer]);

  // Determine real-time atmospheric sky period based on prayer transition
  const autoAtmosphere = useMemo<AtmosphericPeriod>(() => {
    if (!nextPrayer) return 'dhuhr';

    switch (nextPrayer.id) {
      case 'Sunrise':
        // Fajr period leading up to Sunrise
        return 'fajr';
      case 'Dhuhr':
        // Morning / Duha after sunrise leading up to Dhuhr
        return 'sunrise';
      case 'Asr':
        // Dhuhr period leading up to Asr
        return 'dhuhr';
      case 'Maghrib':
        // Asr period leading up to sunset
        return 'asr';
      case 'Isha':
        // Sunset / Dusk twilight leading to Isha
        return 'maghrib';
      case 'Fajr':
      default:
        // Night period leading to next Fajr
        return 'night';
    }
  }, [nextPrayer]);

  const activeTheme = ATMOSPHERIC_THEMES[previewTheme || autoAtmosphere];

  if (!nextPrayer) return null;

  const getRelativeText = () => {
    if (countdown.hours === 0 && countdown.minutes === 0) {
      return `يحين موعد الأذان خلال ${countdown.seconds} ثانية`;
    }
    if (countdown.hours === 0) {
      return `يحين موعد الأذان خلال ${countdown.minutes} دقيقة`;
    }
    return `يحين موعد الأذان خلال ${countdown.hours} ساعة و ${countdown.minutes} دقيقة`;
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div 
      className={`bg-gradient-to-l ${activeTheme.bgGradient} rounded-none p-7 text-white shadow-lg relative overflow-hidden select-none border border-white/10 transition-all duration-1000 ease-in-out`}
    >
      {/* 1. Islamic Geometric 8-Pointed Star Watermark Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        height="100%"
      >
        <defs>
          <pattern id="islamic-star-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M30 0 L36 12 L48 6 L44 18 L56 22 L46 30 L56 38 L44 42 L48 54 L36 48 L30 60 L24 48 L12 54 L16 42 L4 38 L14 30 L4 22 L16 18 L12 6 L24 12 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.8" 
            />
            <circle cx="30" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>

      {/* 2. Dynamic Ambient Atmospheric Glows */}
      <div 
        className={`absolute -left-12 -top-12 w-80 h-80 ${activeTheme.glowPrimary} blur-3xl pointer-events-none transition-all duration-1000`} 
      />
      <div 
        className={`absolute -right-12 -bottom-12 w-80 h-80 ${activeTheme.glowSecondary} blur-3xl pointer-events-none transition-all duration-1000`} 
      />

      <div className="relative z-10">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-none bg-white/15 text-white border border-white/15 font-readex">
              الصلاة القادمة
            </span>

            {/* Atmospheric Sky Badge */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-none border font-readex transition-colors ${activeTheme.badgeBg}`}>
              {activeTheme.icon}
              <span>{activeTheme.periodLabel}</span>
            </span>

            {nextPrayer.notificationEnabled && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-white/80 bg-white/10 px-2.5 py-0.5 rounded-none font-readex">
                <Bell size={11} strokeWidth={2.2} />
                <span>التنبيه مفعّل</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Atmosphere Preview Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPreviewMenu(!showPreviewMenu)}
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-none bg-black/20 hover:bg-black/35 border border-white/15 text-white/90 transition-colors cursor-pointer font-readex"
                title="معاينة ألوان أوقات اليوم (الشفق، الشروق، الظهر، الأصيل، المغرب، الليل)"
              >
                <Eye size={12} />
                <span className="hidden md:inline">{previewTheme ? `معاينة: ${activeTheme.name}` : 'الخلفية: تلقائية'}</span>
              </button>

              {showPreviewMenu && (
                <div 
                  className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900/95 border border-white/15 shadow-2xl z-50 p-1.5 text-right font-readex"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] text-white/50 px-2 py-1 border-b border-white/10 font-bold">
                    معاينة سمات أوقات الصلاة الحية:
                  </div>

                  <button
                    onClick={() => { setPreviewTheme(null); setShowPreviewMenu(false); }}
                    className={`w-full text-right px-2.5 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      previewTheme === null ? 'bg-emerald-800 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>تلقائي (حسب الوقت الفعلي)</span>
                    {previewTheme === null && <span className="text-[10px]">✓</span>}
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  {(Object.keys(ATMOSPHERIC_THEMES) as AtmosphericPeriod[]).map((key) => {
                    const theme = ATMOSPHERIC_THEMES[key];
                    const isSelected = previewTheme === key;

                    return (
                      <button
                        key={key}
                        onClick={() => { setPreviewTheme(key); setShowPreviewMenu(false); }}
                        className={`w-full text-right px-2.5 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-white/20 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {theme.icon}
                          <span>{theme.name}</span>
                        </div>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live countdown pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-black/35 border border-white/15 font-mono text-xs font-semibold text-white">
              <span className={`w-2 h-2 rounded-none ${activeTheme.pulseDot} animate-pulse`} />
              <span>{padZero(countdown.hours)}:{padZero(countdown.minutes)}:{padZero(countdown.seconds)}</span>
            </div>
          </div>
        </div>

        {/* Center: Prayer Name & Scheduled Time */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 my-2">
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-extrabold tracking-tight text-white font-readex">
                {nextPrayer.name}
              </h3>
              <span className="text-white/40 text-xl font-light">|</span>
              <span className={`font-amiri text-3xl font-bold ${activeTheme.accentText}`}>
                {nextPrayer.arabicName}
              </span>
            </div>
            <p className="text-xs text-white/70 font-readex mt-1">
              {activeTheme.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-3xl font-bold font-mono tracking-tight text-white">
            <Clock size={22} strokeWidth={2} className={activeTheme.accentText} />
            <span>{nextPrayer.timeString}</span>
          </div>
        </div>

        {/* Bottom: Natural Language Countdown & Progress Bar */}
        <div className="mt-5 pt-3.5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-white/90 mb-2 font-readex">
            <span className="font-medium">{getRelativeText()}</span>
            <span className="text-[11px] text-white/70 font-mono">
              مضى {Math.round(countdown.progress)}%
            </span>
          </div>

          {/* Progress bar track */}
          <div className="h-1.5 w-full bg-black/40 rounded-none overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-l ${activeTheme.progressGradient} rounded-none transition-all duration-1000 ease-out`}
              style={{ width: `${countdown.progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(countdown.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
