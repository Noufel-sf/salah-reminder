import React from 'react';
import { BookOpen } from 'lucide-react';

export const DailyVerseCard: React.FC = () => {
  return (
    <div className="bg-white rounded-none p-6 border border-slate-200/90 shadow-sm text-right">
      {/* Header Label */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <span className="text-[11px] font-bold flex items-center gap-1.5 text-slate-500 font-readex">
          <BookOpen size={13} strokeWidth={2.2} className="text-emerald-700" />
          آية اليوم
        </span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-none border border-emerald-200 bg-emerald-50 text-emerald-800 font-readex">
          سورة الشرح - الآية ٦
        </span>
      </div>

      {/* Content: Quranic Verse (Amiri) + Reflection (Readex Pro) */}
      <div className="py-1">
        <p className="font-amiri text-2xl font-bold leading-loose mb-2 text-slate-900">
          ﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾
        </p>

        <p className="text-xs font-semibold text-emerald-800 font-readex">
          «وعدٌ رباني مؤكد بأن مع كل ضيق فرجاً، ومع كل شدة تيسيراً»
        </p>

        <p className="text-[11px] font-normal mt-1 leading-relaxed text-slate-500 font-readex">
          تذكرة للمؤمن بأن الابتلاء يعقبه اللطف، وأن رحمة الله قريبة من المحسنين.
        </p>
      </div>
    </div>
  );
};
