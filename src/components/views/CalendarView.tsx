import React from 'react';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { getHijriDate } from '../../utils/prayerTimes';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const hijri = getHijriDate(today);

  // Generate calendar days
  const daysInMonth = 30;
  const currentDay = 12; // Example highlight

  const upcomingEvents = [
    { day: '12', month: 'Rabi\' al-Awwal', title: 'Mawlid an-Nabi (Birth of Prophet Muhammad ﷺ)', type: 'milestone' },
    { day: '27', month: 'Rajab', title: 'Al-Isra\' wal-Mi\'raj (The Night Journey)', type: 'blessed' },
    { day: '15', month: 'Sha\'ban', title: 'Laylat al-Bara\'ah (Night of Forgiveness)', type: 'blessed' },
    { day: '1', month: 'Ramadan', title: 'First Day of Holy Month of Fasting', type: 'ramadan' },
    { day: '27', month: 'Ramadan', title: 'Laylat al-Qadr (Night of Power)', type: 'ramadan' },
    { day: '1', month: 'Shawwal', title: 'Eid al-Fitr (Celebration of Breaking the Fast)', type: 'eid' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Calendar Card */}
      <div className="sage-card p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#edf3ee] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164e3c] text-[#52b788] flex items-center justify-center">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#114232]">{hijri.formatted}</h2>
              <p className="text-xs text-[#74897f]">Islamic Lunar Calendar</p>
            </div>
          </div>
          <span className="arabic-calligraphy text-2xl font-bold text-[#2d6a4f]">
            {hijri.arabic}
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#74897f] mb-3">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span className="text-[#2d6a4f]">Fri</span>
          <span>Sat</span>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const isToday = dayNum === currentDay;

            return (
              <div
                key={dayNum}
                className={`h-12 rounded-2xl flex items-center justify-center text-sm font-semibold transition-all ${
                  isToday
                    ? 'bg-[#164e3c] text-white shadow-md shadow-[#164e3c]/20 font-bold scale-105'
                    : 'bg-[#fafbfa] text-[#3c5248] hover:bg-[#f0f7f2] border border-[#edf3ee]'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Islamic Events Cards */}
      <div className="sage-card p-6">
        <h3 className="font-bold text-sm text-[#114232] mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-[#52b788]" />
          Key Islamic Dates & Occasions
        </h3>

        <div className="space-y-2.5">
          {upcomingEvents.map((event, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fafbfa] border border-[#edf3ee] hover:border-[#b7ddc4] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eaf4ee] text-[#2d6a4f] flex flex-col items-center justify-center font-bold text-xs">
                  <span>{event.day}</span>
                  <span className="text-[9px] uppercase text-[#74897f]">Day</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#114232]">{event.title}</h4>
                  <p className="text-[11px] text-[#74897f]">{event.month}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#2d6a4f] bg-[#eaf4ee] px-2.5 py-1 rounded-full">
                Islamic Milestone
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
