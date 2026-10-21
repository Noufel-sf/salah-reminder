import React from 'react';
import { 
  Sunrise, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  Check, 
  Bell, 
  BellOff, 
  Sparkles 
} from 'lucide-react';
import { PrayerItem, PrayerName } from '../types/prayer';

interface PrayerListProps {
  prayers: PrayerItem[];
  onToggleNotification: (prayerId: PrayerName) => void;
}

const getPrayerIcon = (id: PrayerName) => {
  switch (id) {
    case 'Fajr':
      return <Moon size={18} className="text-indigo-400" />;
    case 'Sunrise':
      return <Sunrise size={18} className="text-amber-400" />;
    case 'Dhuhr':
      return <Sun size={18} className="text-yellow-400" />;
    case 'Asr':
      return <SunMedium size={18} className="text-orange-400" />;
    case 'Maghrib':
      return <Sunset size={18} className="text-rose-400" />;
    case 'Isha':
      return <Moon size={18} className="text-blue-400" />;
    default:
      return <Sparkles size={18} className="text-emerald-400" />;
  }
};

export const PrayerList: React.FC<PrayerListProps> = ({
  prayers,
  onToggleNotification
}) => {
  return (
    <div className="space-y-2 mt-4 select-none">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Today's Schedule
        </span>
        <span className="text-[11px] text-slate-500">
          6 Waqt Prayers
        </span>
      </div>

      {prayers.map((prayer) => {
        const isNext = prayer.isNext;
        const isPassed = prayer.isPassed;

        return (
          <div
            key={prayer.id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
              isNext
                ? 'next-prayer-card bg-amber-500/10 border-amber-500/40 text-white shadow-lg'
                : isPassed
                ? 'bg-white/[0.015] border-white/[0.04] text-slate-400 hover:bg-white/[0.03]'
                : 'bg-white/[0.04] border-white/[0.07] text-slate-200 hover:bg-white/[0.07]'
            }`}
          >
            {/* Left: Icon & Name */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isNext 
                  ? 'bg-amber-500/20 border border-amber-500/30' 
                  : isPassed 
                  ? 'bg-white/[0.03] text-slate-500' 
                  : 'bg-white/[0.06]'
              }`}>
                {getPrayerIcon(prayer.id)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isNext ? 'text-white' : isPassed ? 'text-slate-400' : 'text-slate-100'}`}>
                    {prayer.name}
                  </span>
                  <span className="arabic-text text-xs text-slate-500">
                    {prayer.arabicName}
                  </span>
                  {isNext && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Next
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  {isPassed ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Check size={11} className="text-emerald-500/70" />
                      Passed
                    </span>
                  ) : isNext ? (
                    <span className="text-amber-400/90 font-medium">Upcoming next</span>
                  ) : (
                    <span>Upcoming</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Time & Notification Toggle */}
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm font-semibold tracking-tight ${
                isNext ? 'text-amber-300 font-bold text-base' : isPassed ? 'text-slate-400' : 'text-slate-100'
              }`}>
                {prayer.timeString}
              </span>

              {prayer.id !== 'Sunrise' && (
                <button
                  onClick={() => onToggleNotification(prayer.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    prayer.notificationEnabled
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                      : 'text-slate-600 border-transparent hover:text-slate-400 hover:bg-white/[0.05]'
                  }`}
                  title={prayer.notificationEnabled ? 'Disable notification' : 'Enable notification'}
                >
                  {prayer.notificationEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
