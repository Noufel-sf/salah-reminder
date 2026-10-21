import React from 'react';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { getHijriDate } from '../../utils/prayerTimes';

export const CalendarView: React.FC = () => {
  const today = new Date();
  const hijri = getHijriDate(today);

  // Generate calendar days
  const daysInMonth = 30;
  const currentDay = today.getDate() <= 30 ? today.getDate() : 15;

  const upcomingEvents = [
    { day: '١٢', month: 'ربيع الأول', title: 'المولد النبوي الشريف (مولد سيد الخلق محمد ﷺ)', type: 'milestone' },
    { day: '٢٧', month: 'رجب', title: 'ذكرى الإسراء والمعراج', type: 'blessed' },
    { day: '١٥', month: 'شعبان', title: 'ليلة النصف من شعبان (ليلة المغفرة والرحمة)', type: 'blessed' },
    { day: '١', month: 'رمضان', title: 'أول أيام شهر رمضان المبارك (بدء الصيام)', type: 'ramadan' },
    { day: '٢٧', month: 'رمضان', title: 'ليلة القدر المباركة (خيرٌ من ألف شهر)', type: 'ramadan' },
    { day: '١', month: 'شوال', title: 'عيد الفطر المبارك', type: 'eid' },
    { day: '٩', month: 'ذو الحجة', title: 'يوم عرفة المبارك (خير يوم طلعت عليه الشمس)', type: 'hajj' },
    { day: '١٠', month: 'ذو الحجة', title: 'عيد الأضحى المبارك', type: 'eid' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-right font-readex">
      {/* Calendar Card */}
      <div className="bg-white rounded-none p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-readex">{hijri.arabic}</h2>
              <p className="text-xs text-slate-500 font-readex">التقويم القمري الإسلامي</p>
            </div>
          </div>
          <span className="font-amiri text-2xl font-bold text-emerald-800">
            أيام الشهر
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 mb-3 font-readex">
          <span>الأحد</span>
          <span>الإثنين</span>
          <span>الثلاثاء</span>
          <span>الأربعاء</span>
          <span>الخميس</span>
          <span className="text-emerald-800 font-extrabold">الجمعة</span>
          <span>السبت</span>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const isToday = dayNum === currentDay;

            return (
              <div
                key={dayNum}
                className={`h-12 rounded-none flex items-center justify-center text-sm font-semibold transition-all cursor-pointer font-mono ${
                  isToday
                    ? 'bg-emerald-800 text-white shadow-sm font-bold scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Islamic Events Cards */}
      <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2 font-readex">
          <Sparkles size={16} className="text-emerald-700" />
          <span>المناسبات والأيام الإسلامية المباركة</span>
        </h3>

        <div className="space-y-2.5">
          {upcomingEvents.map((event, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-none bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-emerald-100/70 border border-emerald-200 text-emerald-900 flex flex-col items-center justify-center font-bold text-xs shrink-0 font-amiri">
                  <span className="text-sm font-bold">{event.day}</span>
                  <span className="text-[9px] text-emerald-700 font-readex">يوم</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-readex">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 font-readex mt-0.5">{event.month}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 border border-emerald-200 px-3 py-1 rounded-none font-readex">
                مناسبة مباركة
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
