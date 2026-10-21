import React from 'react';
import { BookOpen } from 'lucide-react';

export const DailyVerseCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      {/* Header Label */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-slate-400">
          <BookOpen size={12} strokeWidth={2.2} className="text-emerald-700" />
          Verse of the Day
        </span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800">
          Al-Inshirah 94:6
        </span>
      </div>

      {/* Content: Arabic + Translation */}
      <div className="py-1">
        <p className="arabic-text text-2xl font-bold leading-loose mb-3 text-slate-900">
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </p>

        <p className="text-xs font-semibold italic text-emerald-800">
          "Indeed, with hardship comes ease."
        </p>

        <p className="text-[11px] font-normal mt-1 leading-relaxed text-slate-500">
          A timeless divine promise that every difficulty is followed by relief.
        </p>
      </div>
    </div>
  );
};
