import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft,
  ArrowUpLeft
} from 'lucide-react';
import { 
  getTodayDhikr, 
  getAllTimeDhikrTotals,
  DailyDhikrRecord
} from '../../utils/worshipStats';

interface DashboardStatsProps {
  onOpenTasbih?: () => void;
  onOpenDuas?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  onOpenTasbih
}) => {
  // Real Dhikr stats from localStorage
  const [dhikrRecord, setDhikrRecord] = useState<DailyDhikrRecord>(getTodayDhikr());
  const [allTimeTotals, setAllTimeTotals] = useState(getAllTimeDhikrTotals());

  useEffect(() => {
    const handleWorshipUpdate = () => {
      setDhikrRecord(getTodayDhikr());
      setAllTimeTotals(getAllTimeDhikrTotals());
    };

    window.addEventListener('worship-stats-updated', handleWorshipUpdate);
    return () => window.removeEventListener('worship-stats-updated', handleWorshipUpdate);
  }, []);

  const statCards = [
    {
      key: 'tasbih' as const,
      arabic: 'سُبْحَانَ اللَّهِ',
      title: 'التسبيح',
      meaning: 'تنزيه الله تعالى عن كل نقص وعيب',
      todayCount: dhikrRecord.tasbih,
      allTimeCount: allTimeTotals.tasbih,
      badge: 'فضل عظيم',
      accentColor: 'text-emerald-800',
      bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    {
      key: 'tahmeed' as const,
      arabic: 'الْحَمْدُ لِلَّهِ',
      title: 'التحميد',
      meaning: 'الشكر والثناء على النعم والفضل',
      todayCount: dhikrRecord.tahmeed,
      allTimeCount: allTimeTotals.tahmeed,
      badge: 'تملأ الميزان',
      accentColor: 'text-emerald-800',
      bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    {
      key: 'takbeer' as const,
      arabic: 'اللَّهُ أَكْبَرُ',
      title: 'التكبير',
      meaning: 'الله أعظم وأجل من كل ما سواه',
      todayCount: dhikrRecord.takbeer,
      allTimeCount: allTimeTotals.takbeer,
      badge: 'أحب الكلام',
      accentColor: 'text-emerald-800',
      bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    },
    {
      key: 'istighfar' as const,
      arabic: 'أَسْتَغْفِرُ اللَّهَ',
      title: 'الاستغفار',
      meaning: 'طلب المغفرة والستر ومحو الذنوب',
      todayCount: dhikrRecord.istighfar,
      allTimeCount: allTimeTotals.istighfar,
      badge: 'مغفرة وبركة',
      accentColor: 'text-emerald-800',
      bgBadge: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-2 font-readex">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-800 font-readex">
            إحصائيات الأذكار اليومية المحفوظة
          </h3>
          <span className="text-[11px] text-slate-400 font-readex">
            (إجمالي اليوم: <span className="font-bold text-emerald-800 font-mono">{dhikrRecord.total}</span> ذكر)
          </span>
        </div>

        {onOpenTasbih && (
          <button
            onClick={onOpenTasbih}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors font-readex"
          >
            <span>فتح صفحة الأذكار والمسبحة</span>
            <ChevronLeft size={13} />
          </button>
        )}
      </div>

      {/* 4 Real Adhkar Cards - Non-interactive counters, click navigates to Adkar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            onClick={onOpenTasbih}
            className="bg-white rounded-none p-5 border border-slate-200/90 shadow-sm hover:border-emerald-500/70 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between text-right"
            title={`انقر للانتقال لصفحة الأذكار والمسبحة`}
          >
            {/* Top row: Title & Badge */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 font-readex group-hover:text-emerald-800 transition-colors">
                  {card.title}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 border ${card.bgBadge}`}>
                  {card.badge}
                </span>
              </div>

              {/* Arabic Phrase */}
              <p className="font-amiri text-2xl font-bold text-slate-900 leading-snug my-1">
                {card.arabic}
              </p>
              <p className="text-[11px] text-slate-400 font-readex truncate">
                {card.meaning}
              </p>
            </div>

            {/* Bottom row: Real Counters and Navigation hint */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-readex">
                  تسجيل اليوم:
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-emerald-800 transition-colors">
                    {card.todayCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    / كلي: {card.allTimeCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 opacity-80 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all font-readex">
                <span>المسبحة</span>
                <ArrowUpLeft size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
